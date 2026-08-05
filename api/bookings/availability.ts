import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RESTAURANTS } from '../../src/data/mockData';
import { adminDb } from '../../src/lib/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method Not Allowed',
    });
    return;
  }

  const venueId = req.query.venueId as string;
  const dateStr = req.query.date as string;

  const venue = RESTAURANTS.find((r) => r.id === venueId);
  if (!venue) {
    res.status(404).json({ ok: false, success: false, error: 'Заведение не найдено' });
    return;
  }

  try {
    const existingSnap = await adminDb
      .collection('bookings')
      .where('restaurantId', '==', venueId)
      .where('visitDate', '==', dateStr)
      .get();

    const existing = existingSnap.docs
      .map((doc) => doc.data())
      .filter((b) => b.status !== 'cancelled' && b.status !== 'rejected');

    const slotCapacity = venue.slotCapacity || 6;
    const timeSlots = [
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
      '22:00', '22:30',
    ];

    const availability = timeSlots.map((time) => {
      const bookedAtSlot = existing.filter((b) => b.visitTime === time).length;
      return { time, available: slotCapacity - bookedAtSlot > 0, remaining: Math.max(0, slotCapacity - bookedAtSlot) };
    });

    const occupiedTableIds = existing.filter((b) => b.tableId).map((b) => b.tableId!);

    res.status(200).json({
      ok: true,
      success: true,
      slots: availability,
      occupiedTableIds,
    });
  } catch (err: any) {
    console.error('[Availability error]', err);
    res.status(500).json({
      ok: false,
      success: false,
      error: 'Ошибка получения слотов',
    });
  }
}
