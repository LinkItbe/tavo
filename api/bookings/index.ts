import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../../src/lib/firebaseAdmin';
import { createBooking } from '../../src/server/bookings';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const result = await createBooking(req, clientIp);
      res.status(result.statusCode).json(result.body);
    } catch (err: any) {
      console.error('[API bookings index POST error]', err);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Внутренняя ошибка сервера',
      });
    }
    return;
  }

  if (req.method === 'GET') {
    const idsQuery = req.query.ids as string;
    try {
      if (idsQuery) {
        const idsList = idsQuery.split(',').map((i) => i.trim()).filter(Boolean);
        if (idsList.length === 0) {
          res.status(200).json({ ok: true, success: true, bookings: [] });
          return;
        }

        const docsSnap = await adminDb
          .collection('bookings')
          .where('id', 'in', idsList.slice(0, 10))
          .get();

        const bookings = docsSnap.docs.map((d) => d.data());
        res.status(200).json({ ok: true, success: true, bookings });
        return;
      }

      res.status(200).json({ ok: true, success: true, bookings: [] });
    } catch (err: any) {
      console.error('[API bookings index GET error]', err);
      res.status(500).json({ ok: false, success: false, error: 'Ошибка сервера' });
    }
    return;
  }

  res.status(405).json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    message: 'Method Not Allowed',
  });
}
