import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPartnerMe } from '../../src/server/partner';

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

  try {
    const result = await getPartnerMe(req);
    res.status(result.statusCode).json(result.body);
  } catch (err: any) {
    console.error('[API partner/me error]', err);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Внутренняя ошибка сервера',
    });
  }
}
