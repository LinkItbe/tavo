import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../lib/firebaseAdmin';
import { verifyUserToken } from './auth';
import { checkRateLimit, generateRandomToken, hashToken } from '../lib/serverUtils';

export async function createBooking(
  req: { body?: any; ip?: string },
  clientIp = 'unknown'
) {
  const ip = req.ip || clientIp;
  const body = req.body || {};

  // Honeypot check
  if (body.website || body.address_hp) {
    return {
      statusCode: 200,
      body: {
        ok: true,
        success: true,
        bookingId: 'bk_' + Date.now(),
        bookingCode: 'TV-12345',
        guestAccessToken: 'hp_token',
        status: 'confirmed',
      },
    };
  }

  if (!checkRateLimit(`create_${ip}`, 15, 60000)) {
    return {
      statusCode: 429,
      body: { ok: false, success: false, code: 'RATE_LIMIT', message: 'Слишком много запросов. Попробуйте позже.', error: 'Слишком много запросов. Попробуйте позже.' },
    };
  }

  const {
    restaurantId,
    customerName,
    customerPhone,
    customerEmail,
    visitDate,
    visitTime,
    partySize,
    tableId,
    customerNote,
  } = body;

  if (!restaurantId || !customerName || !customerPhone || !visitDate || !visitTime) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'MISSING_FIELDS', message: 'Пожалуйста, заполните все обязательные поля.', error: 'Пожалуйста, заполните все обязательные поля.' },
    };
  }

  const parsedParty = Number(partySize);
  if (isNaN(parsedParty) || parsedParty < 1 || parsedParty > 20) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_PARTY_SIZE', message: 'Количество гостей должно быть от 1 до 20.', error: 'Количество гостей должно быть от 1 до 20.' },
    };
  }

  if (String(customerName).trim().length < 2) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_NAME', message: 'Укажите ваше имя.', error: 'Укажите ваше имя.' },
    };
  }

  if (String(customerPhone).trim().length < 5) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_PHONE', message: 'Укажите корректный номер телефона.', error: 'Укажите корректный номер телефона.' },
    };
  }

  try {
    const restSnap = await adminDb.collection('restaurants').doc(restaurantId).get();
    if (!restSnap.exists || !restSnap.data()?.active) {
      return {
        statusCode: 404,
        body: { ok: false, success: false, code: 'RESTAURANT_NOT_FOUND', message: 'Ресторан не найден или недоступен.', error: 'Ресторан не найден или недоступен.' },
      };
    }

    const restData = restSnap.data()!;

    // Validate operating hours
    if (restData.openingTime && restData.closingTime) {
      const [openH, openM] = restData.openingTime.split(':').map(Number);
      const [closeH, closeM] = restData.closingTime.split(':').map(Number);
      const [visitH, visitM] = String(visitTime).split(':').map(Number);

      const openMins = openH * 60 + (openM || 0);
      const closeMins = closeH * 60 + (closeM || 0);
      const visitMins = visitH * 60 + (visitM || 0);

      const isWithin =
        closeMins > openMins
          ? visitMins >= openMins && visitMins < closeMins
          : visitMins >= openMins || visitMins < closeMins;

      if (!isWithin) {
        return {
          statusCode: 400,
          body: {
            ok: false,
            success: false,
            code: 'RESTAURANT_CLOSED',
            message: `Ресторан закрыт в это время. Часы работы: ${restData.openingTime}–${restData.closingTime}`,
            error: `Ресторан закрыт в это время. Часы работы: ${restData.openingTime}–${restData.closingTime}`,
          },
        };
      }
    }

    // Resolve Table
    let assignedTableId = tableId || null;
    let assignedTableName = 'Стол назначит ресторан';

    if (assignedTableId) {
      const tableSnap = await adminDb
        .collection('restaurants')
        .doc(restaurantId)
        .collection('tables')
        .doc(assignedTableId)
        .get();

      if (!tableSnap.exists || !tableSnap.data()?.active) {
        return {
          statusCode: 400,
          body: { ok: false, success: false, code: 'TABLE_NOT_FOUND', message: 'Выбранный стол не существует или неактивен.', error: 'Выбранный стол не существует или неактивен.' },
        };
      }
      const tData = tableSnap.data()!;
      if (tData.capacity < parsedParty) {
        return {
          statusCode: 400,
          body: {
            ok: false,
            success: false,
            code: 'CAPACITY_EXCEEDED',
            message: `Стол "${tData.name}" рассчитан максимум на ${tData.capacity} гостей.`,
            error: `Стол "${tData.name}" рассчитан максимум на ${tData.capacity} гостей.`,
          },
        };
      }
      assignedTableName = `${tData.name} · ${tData.zone}`;
    } else {
      // Auto assign table if possible
      const tablesSnap = await adminDb
        .collection('restaurants')
        .doc(restaurantId)
        .collection('tables')
        .where('active', '==', true)
        .get();

      const candidateTables = tablesSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((t) => t.capacity >= parsedParty)
        .sort((a, b) => a.capacity - b.capacity);

      for (const t of candidateTables) {
        const lockRef = adminDb
          .collection('bookingLocks')
          .doc(`${restaurantId}_${visitDate}_${visitTime}_${t.id}`);
        const lockSnap = await lockRef.get();
        if (!lockSnap.exists || lockSnap.data()?.active === false) {
          assignedTableId = t.id;
          assignedTableName = `${t.name} · ${t.zone}`;
          break;
        }
      }
    }

    const newBookingId = 'tb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const lockId = assignedTableId ? `${restaurantId}_${visitDate}_${visitTime}_${assignedTableId}` : null;

    const result = await adminDb.runTransaction(async (transaction) => {
      if (lockId) {
        const lockRef = adminDb.collection('bookingLocks').doc(lockId);
        const lockSnap = await transaction.get(lockRef);
        if (lockSnap.exists && lockSnap.data()?.active === true) {
          throw new Error('TABLE_ALREADY_BOOKED');
        }
      }

      const bookingMode = restData.bookingMode || 'instant';
      const initialStatus = bookingMode === 'instant' ? 'confirmed' : 'pending';

      const bookingCode = `TV-${Math.floor(10000 + Math.random() * 90000)}`;
      const guestAccessToken = generateRandomToken();
      const guestAccessTokenHash = hashToken(guestAccessToken);

      const visitAtDate = new Date(`${visitDate}T${visitTime}:00`);
      const visitAt = Timestamp.fromDate(visitAtDate);

      const bookingRef = adminDb.collection('bookings').doc(newBookingId);
      transaction.set(bookingRef, {
        id: newBookingId,
        bookingCode,
        restaurantId,
        restaurantName: restData.name,
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        customerEmail: (customerEmail || '').trim(),
        visitDate,
        visitTime,
        visitAt,
        partySize: parsedParty,
        tableId: assignedTableId || null,
        tableName: assignedTableName,
        status: initialStatus,
        bookingMode,
        customerNote: (customerNote || '').trim(),
        restaurantNote: '',
        source: 'tavoo',
        guestAccessTokenHash,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (lockId) {
        const lockRef = adminDb.collection('bookingLocks').doc(lockId);
        transaction.set(lockRef, {
          bookingId: newBookingId,
          restaurantId,
          tableId: assignedTableId,
          visitDate,
          visitTime,
          active: true,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      const eventRef = adminDb
        .collection('bookingEvents')
        .doc('evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
      transaction.set(eventRef, {
        bookingId: newBookingId,
        restaurantId,
        type: 'booking_created',
        actorType: 'guest',
        actorUid: null,
        fromStatus: null,
        toStatus: initialStatus,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { bookingCode, guestAccessToken, initialStatus, tableId: assignedTableId, tableName: assignedTableName };
    });

    return {
      statusCode: 200,
      body: {
        ok: true,
        success: true,
        bookingId: newBookingId,
        bookingCode: result.bookingCode,
        guestAccessToken: result.guestAccessToken,
        status: result.initialStatus,
        tableId: result.tableId,
        tableName: result.tableName,
      },
    };
  } catch (err: any) {
    if (err?.message === 'TABLE_ALREADY_BOOKED') {
      return {
        statusCode: 409,
        body: { ok: false, success: false, code: 'TABLE_ALREADY_BOOKED', message: 'Стол уже забронирован на выбранное время.', error: 'Стол уже забронирован на выбранное время.' },
      };
    }
    console.error('[Create Booking Error]', err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Не удалось создать бронирование. Попробуйте еще раз.', error: 'Не удалось создать бронирование. Попробуйте еще раз.' },
    };
  }
}

export async function getGuestBooking(req: { body?: any }) {
  const { bookingId, guestAccessToken } = req.body || {};

  if (!bookingId || !guestAccessToken) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'MISSING_FIELDS', message: 'Параметры не указаны.', error: 'Параметры не указаны.' },
    };
  }

  try {
    const tokenHash = hashToken(guestAccessToken);
    const docSnap = await adminDb.collection('bookings').doc(bookingId).get();

    if (!docSnap.exists) {
      return {
        statusCode: 404,
        body: { ok: false, success: false, code: 'NOT_FOUND', message: 'Бронирование не найдено.', error: 'Бронирование не найдено.' },
      };
    }

    const data = docSnap.data()!;
    if (data.guestAccessTokenHash !== tokenHash) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'FORBIDDEN', message: 'Недействительный токен доступа.', error: 'Недействительный токен доступа.' },
      };
    }

    return {
      statusCode: 200,
      body: {
        ok: true,
        success: true,
        booking: {
          id: data.id,
          bookingCode: data.bookingCode,
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          visitDate: data.visitDate,
          visitTime: data.visitTime,
          partySize: data.partySize,
          tableId: data.tableId,
          tableName: data.tableName,
          status: data.status,
          bookingMode: data.bookingMode,
          customerNote: data.customerNote,
          restaurantNote: data.restaurantNote,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        },
      },
    };
  } catch (err) {
    console.error('[Get Guest Booking Error]', err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Ошибка сервера.', error: 'Ошибка сервера.' },
    };
  }
}

export async function cancelGuestBooking(req: { body?: any }) {
  const { bookingId, guestAccessToken } = req.body || {};

  if (!bookingId || !guestAccessToken) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'MISSING_FIELDS', message: 'Параметры не указаны.', error: 'Параметры не указаны.' },
    };
  }

  try {
    const tokenHash = hashToken(guestAccessToken);
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const docSnap = await bookingRef.get();

    if (!docSnap.exists) {
      return {
        statusCode: 404,
        body: { ok: false, success: false, code: 'NOT_FOUND', message: 'Бронирование не найдено.', error: 'Бронирование не найдено.' },
      };
    }

    const data = docSnap.data()!;
    if (data.guestAccessTokenHash !== tokenHash) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'FORBIDDEN', message: 'Недействительный токен доступа.', error: 'Недействительный токен доступа.' },
      };
    }

    if (!['pending', 'confirmed'].includes(data.status)) {
      return {
        statusCode: 400,
        body: { ok: false, success: false, code: 'CANNOT_CANCEL', message: 'Данное бронирование уже нельзя отменить.', error: 'Данное бронирование уже нельзя отменить.' },
      };
    }

    await adminDb.runTransaction(async (transaction) => {
      const oldStatus = data.status;
      transaction.update(bookingRef, {
        status: 'cancelled',
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (data.tableId) {
        const lockId = `${data.restaurantId}_${data.visitDate}_${data.visitTime}_${data.tableId}`;
        const lockRef = adminDb.collection('bookingLocks').doc(lockId);
        transaction.set(lockRef, { active: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }

      const eventRef = adminDb
        .collection('bookingEvents')
        .doc('evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
      transaction.set(eventRef, {
        bookingId,
        restaurantId: data.restaurantId,
        type: 'cancelled_by_guest',
        actorType: 'guest',
        actorUid: null,
        fromStatus: oldStatus,
        toStatus: 'cancelled',
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      statusCode: 200,
      body: { ok: true, success: true, status: 'cancelled' },
    };
  } catch (err) {
    console.error('[Cancel Guest Booking Error]', err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Не удалось отменить бронирование.', error: 'Не удалось отменить бронирование.' },
    };
  }
}

export async function updatePartnerBookingStatus(req: { headers: Record<string, any>; body?: any }) {
  const authResult = await verifyUserToken(req);
  if (!authResult.ok) {
    return {
      statusCode: authResult.statusCode,
      body: { ok: false, success: false, code: authResult.code, message: authResult.error, error: authResult.error },
    };
  }

  const { uid } = authResult;
  const { bookingId, newStatus, restaurantNote, tableId, tableName } = req.body || {};

  if (!bookingId || !newStatus) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'MISSING_FIELDS', message: 'Не указаны обязательные параметры.', error: 'Не указаны обязательные параметры.' },
    };
  }

  try {
    const memberDoc = await adminDb.collection('restaurantMembers').doc(uid).get();
    if (!memberDoc.exists || !memberDoc.data()?.active) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'FORBIDDEN', message: 'Доступ запрещен.', error: 'Доступ запрещен.' },
      };
    }

    const memberData = memberDoc.data()!;
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return {
        statusCode: 404,
        body: { ok: false, success: false, code: 'NOT_FOUND', message: 'Бронирование не найдено.', error: 'Бронирование не найдено.' },
      };
    }

    const bookingData = bookingSnap.data()!;
    if (bookingData.restaurantId !== memberData.restaurantId) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'FORBIDDEN', message: 'У вас нет доступа к бронированиям этого ресторана.', error: 'У вас нет доступа к бронированиям этого ресторана.' },
      };
    }

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'declined', 'cancelled'],
      confirmed: ['seated', 'cancelled', 'no_show'],
      seated: ['completed'],
    };

    const currentStatus = bookingData.status;
    const allowed = validTransitions[currentStatus] || [];
    if (newStatus !== currentStatus && !allowed.includes(newStatus)) {
      return {
        statusCode: 400,
        body: {
          ok: false,
          success: false,
          code: 'INVALID_TRANSITION',
          message: `Невозможно перевести статус из "${currentStatus}" в "${newStatus}".`,
          error: `Невозможно перевести статус из "${currentStatus}" в "${newStatus}".`,
        },
      };
    }

    await adminDb.runTransaction(async (transaction) => {
      const updates: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (newStatus !== currentStatus) {
        updates.status = newStatus;
      }

      if (restaurantNote !== undefined) {
        updates.restaurantNote = String(restaurantNote).trim();
      }

      if (tableId !== undefined) {
        updates.tableId = tableId || null;
      }
      if (tableName !== undefined) {
        updates.tableName = tableName || 'Стол назначит ресторан';
      }

      transaction.update(bookingRef, updates);

      const oldTableId = bookingData.tableId;
      const targetTableId = tableId !== undefined ? tableId : oldTableId;

      if (['declined', 'cancelled', 'no_show'].includes(newStatus)) {
        if (oldTableId) {
          const oldLockId = `${bookingData.restaurantId}_${bookingData.visitDate}_${bookingData.visitTime}_${oldTableId}`;
          const oldLockRef = adminDb.collection('bookingLocks').doc(oldLockId);
          transaction.set(oldLockRef, { active: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        }
      } else if (tableId !== undefined && tableId !== oldTableId) {
        if (oldTableId) {
          const oldLockId = `${bookingData.restaurantId}_${bookingData.visitDate}_${bookingData.visitTime}_${oldTableId}`;
          const oldLockRef = adminDb.collection('bookingLocks').doc(oldLockId);
          transaction.set(oldLockRef, { active: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        }
        if (targetTableId) {
          const newLockId = `${bookingData.restaurantId}_${bookingData.visitDate}_${bookingData.visitTime}_${targetTableId}`;
          const newLockRef = adminDb.collection('bookingLocks').doc(newLockId);
          transaction.set(newLockRef, {
            bookingId,
            restaurantId: bookingData.restaurantId,
            tableId: targetTableId,
            visitDate: bookingData.visitDate,
            visitTime: bookingData.visitTime,
            active: true,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }

      const eventRef = adminDb
        .collection('bookingEvents')
        .doc('evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
      transaction.set(eventRef, {
        bookingId,
        restaurantId: bookingData.restaurantId,
        type: newStatus,
        actorType: 'restaurant',
        actorUid: uid,
        fromStatus: currentStatus,
        toStatus: newStatus,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      statusCode: 200,
      body: { ok: true, success: true, bookingId, status: newStatus },
    };
  } catch (err) {
    console.error('[Partner Status Update Error]', err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Не удалось обновить статус.', error: 'Не удалось обновить статус.' },
    };
  }
}
