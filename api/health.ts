import type { VercelRequest, VercelResponse } from '@vercel/node';

export function GET(): Response {
  return Response.json({
    ok: true,
    service: "tavoo",
  });
}

  res.status(200).json({
    ok: true,
    service: 'tavoo',
  });
}
