import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../lib/firebaseAdmin.js';
import { verifyUserToken } from './auth';
import { checkRateLimit, hashToken } from '../lib/serverUtils';

export interface ClaimRequest {
  restaurantId?: string;
  claimCode?: string;
}

export async function claimPartnerAccount(
  req: { headers: Record<string, any>; body?: any; ip?: string },
  clientIp = 'unknown'
) {
  const ip = req.ip || clientIp;
  if (!checkRateLimit(`claim_${ip}`, 10, 60000)) {
    return {
      statusCode: 429,
      body: { ok: false, success: false, code: 'RATE_LIMIT', message: 'Слишком много попыток. Попробуйте позже.', error: 'Слишком много попыток. Попробуйте позже.' },
    };
  }

  const authResult = await verifyUserToken(req);
  if (!authResult.ok) {
    return {
      statusCode: authResult.statusCode,
      body: { ok: false, success: false, code: authResult.code, message: authResult.error, error: authResult.error },
    };
  }

  const { uid, email } = authResult;
  const { restaurantId, claimCode }: ClaimRequest = req.body || {};

  if (!restaurantId || !claimCode) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'MISSING_FIELDS', message: 'Не указаны ресторан или код подключения', error: 'Не указаны ресторан или код подключения' },
    };
  }

  const expectedSecret = process.env.TAVOO_PARTNER_CLAIM_CODE;
  if (!expectedSecret || claimCode.trim() !== expectedSecret.trim()) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_CLAIM_CODE', message: 'Неверный код подключения', error: 'Неверный код подключения' },
    };
  }

  if (!['osteria-cantina', 'mornings-and-beans'].includes(restaurantId)) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_RESTAURANT', message: 'Недопустимый ресторан', error: 'Недопустимый ресторан' },
    };
  }

  try {
    // Check if user already owns an active restaurant
    const memberDoc = await adminDb.collection('restaurantMembers').doc(uid).get();
    if (memberDoc.exists && memberDoc.data()?.active) {
      return {
        statusCode: 400,
        body: { ok: false, success: false, code: 'ALREADY_MEMBER', message: 'Пользователь уже подключен к ресторану', error: 'Пользователь уже подключен к ресторану' },
      };
    }

    // Check if target restaurant is already claimed
    const existingOwner = await adminDb
      .collection('restaurantMembers')
      .where('restaurantId', '==', restaurantId)
      .where('role', '==', 'owner')
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!existingOwner.empty) {
      return {
        statusCode: 400,
        body: { ok: false, success: false, code: 'ALREADY_CLAIMED', message: 'Этот ресторан уже подключён', error: 'Этот ресторан уже подключён' },
      };
    }

    // Create member doc
    await adminDb.collection('restaurantMembers').doc(uid).set({
      uid,
      email,
      restaurantId,
      role: 'owner',
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update restaurant
    await adminDb.collection('restaurants').doc(restaurantId).set(
      {
        ownerUid: uid,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Update system/partnerPilot
    await adminDb.collection('system').doc('partnerPilot').set(
      {
        claimedRestaurants: FieldValue.arrayUnion(restaurantId),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      body: { ok: true, success: true, restaurantId },
    };
  } catch (err: any) {
    console.error('[Partner Claim Error]', err?.message || err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Не удалось подключить аккаунт', error: 'Не удалось подключить аккаунт' },
    };
  }
}

export async function getPartnerMe(req: { headers: Record<string, any>; body?: any }) {
  const authResult = await verifyUserToken(req);
  if (!authResult.ok) {
    return {
      statusCode: authResult.statusCode,
      body: { ok: false, success: false, code: authResult.code, message: authResult.error, error: authResult.error },
    };
  }

  const { uid } = authResult;

  try {
    const memberDoc = await adminDb.collection('restaurantMembers').doc(uid).get();
    if (!memberDoc.exists || !memberDoc.data()?.active) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'NO_MEMBER', message: 'Доступ к кабинету ресторана не настроен', error: 'Доступ к кабинету ресторана не настроен' },
      };
    }

    const memberData = memberDoc.data()!;
    const restDoc = await adminDb.collection('restaurants').doc(memberData.restaurantId).get();

    if (!restDoc.exists || !restDoc.data()?.active) {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'RESTAURANT_INACTIVE', message: 'Ресторан деактивирован', error: 'Ресторан деактивирован' },
      };
    }

    return {
      statusCode: 200,
      body: {
        ok: true,
        success: true,
        member: memberData,
        restaurant: restDoc.data(),
      },
    };
  } catch (err: any) {
    console.error('[Partner Me Error]', err?.message || err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Ошибка получения данных кабинета', error: 'Ошибка получения данных кабинета' },
    };
  }
}

export async function importDemoBookings(req: { headers: Record<string, any>; body?: any }) {
  const authResult = await verifyUserToken(req);
  if (!authResult.ok) {
    return {
      statusCode: authResult.statusCode,
      body: { ok: false, success: false, code: authResult.code, message: authResult.error, error: authResult.error },
    };
  }

  const { uid } = authResult;
  const { bookings } = req.body || {};

  if (!Array.isArray(bookings)) {
    return {
      statusCode: 400,
      body: { ok: false, success: false, code: 'INVALID_BODY', message: 'Список бронирований не указан', error: 'Список бронирований не указан' },
    };
  }

  try {
    const memberDoc = await adminDb.collection('restaurantMembers').doc(uid).get();
    if (!memberDoc.exists || !memberDoc.data()?.active || memberDoc.data()?.role !== 'owner') {
      return {
        statusCode: 403,
        body: { ok: false, success: false, code: 'FORBIDDEN', message: 'Только владелец ресторана может импортировать демо-данные', error: 'Только владелец ресторана может импортировать демо-данные' },
      };
    }

    const memberData = memberDoc.data()!;
    const restaurantId = memberData.restaurantId;

    let importedCount = 0;
    let skippedCount = 0;

    for (const item of bookings) {
      if (!item || item.restaurantId !== restaurantId || !item.id) {
        skippedCount++;
        continue;
      }

      const docRef = adminDb.collection('bookings').doc(item.id);
      const existing = await docRef.get();

      if (existing.exists) {
        skippedCount++;
        continue;
      }

      await docRef.set({
        id: item.id,
        bookingCode: item.bookingCode || `TV-${item.id.slice(-5)}`,
        restaurantId,
        restaurantName: item.restaurantId === 'osteria-cantina' ? 'Osteria Cantina' : 'Mornings & Beans',
        customerName: item.customerName || 'Гость',
        customerPhone: item.customerPhone || '+375290000000',
        customerEmail: item.customerEmail || '',
        visitDate: item.visitDate || '2026-08-05',
        visitTime: item.visitTime || '19:00',
        partySize: Number(item.partySize) || 2,
        tableId: item.tableId || null,
        tableName: item.tableName || 'Стол',
        status: item.status || 'confirmed',
        bookingMode: item.bookingMode || 'instant',
        customerNote: item.customerNote || '',
        restaurantNote: item.restaurantNote || '',
        source: 'demo_import',
        guestAccessTokenHash: hashToken('demo_import_' + item.id),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      importedCount++;
    }

    return {
      statusCode: 200,
      body: { ok: true, success: true, importedCount, skippedCount },
    };
  } catch (err: any) {
    console.error('[Import Demo Bookings Error]', err?.message || err);
    return {
      statusCode: 500,
      body: { ok: false, success: false, code: 'SERVER_ERROR', message: 'Ошибка импорта данных', error: 'Ошибка импорта данных' },
    };
  }
}
