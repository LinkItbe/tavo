import type { VercelRequest, VercelResponse } from '@vercel/node';
import { claimPartnerAccount } from '../../src/server/partner.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method Not Allowed',
    });
    return;
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const result = await claimPartnerAccount(req, clientIp);
    res.status(result.statusCode).json(result.body);
  } catch (err: any) {
    console.error('[API partner/claim error]', err);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Внутренняя ошибка сервера',
    });
  }
}
