import { adminAuth } from '../lib/firebaseAdmin';

export function getBearerToken(req: { headers: Record<string, any>; body?: any }): string | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.body && req.body.idToken) {
    return req.body.idToken;
  }
  return null;
}

export async function verifyUserToken(req: { headers: Record<string, any>; body?: any }) {
  const token = getBearerToken(req);
  if (!token) {
    return { ok: false as const, error: 'Необходима авторизация', code: 'UNAUTHORIZED', statusCode: 401 };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { ok: true as const, uid: decoded.uid, email: decoded.email || '', decoded };
  } catch (err: any) {
    return { ok: false as const, error: 'Недействительная сессия', code: 'INVALID_TOKEN', statusCode: 401 };
  }
}
