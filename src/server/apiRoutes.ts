import { Router, Request, Response } from 'express';
import { claimPartnerAccount, getPartnerMe, importDemoBookings } from './partner';
import { createBooking, getGuestBooking, cancelGuestBooking, updatePartnerBookingStatus } from './bookings';

export const partnerApiRouter = Router();

// 1. POST /api/partner/claim
partnerApiRouter.post('/partner/claim', async (req: Request, res: Response) => {
  const result = await claimPartnerAccount(req, req.ip);
  res.status(result.statusCode).json(result.body);
});

// 2. GET /api/partner/me
partnerApiRouter.get('/partner/me', async (req: Request, res: Response) => {
  const result = await getPartnerMe(req);
  res.status(result.statusCode).json(result.body);
});

// 3. POST /api/bookings/create
partnerApiRouter.post('/bookings/create', async (req: Request, res: Response) => {
  const result = await createBooking(req, req.ip);
  res.status(result.statusCode).json(result.body);
});

// 4. POST /api/bookings/get
partnerApiRouter.post('/bookings/get', async (req: Request, res: Response) => {
  const result = await getGuestBooking(req);
  res.status(result.statusCode).json(result.body);
});

// 5. POST /api/bookings/cancel
partnerApiRouter.post('/bookings/cancel', async (req: Request, res: Response) => {
  const result = await cancelGuestBooking(req);
  res.status(result.statusCode).json(result.body);
});

// 6. POST /api/partner/bookings/update-status
partnerApiRouter.post('/partner/bookings/update-status', async (req: Request, res: Response) => {
  const result = await updatePartnerBookingStatus(req);
  res.status(result.statusCode).json(result.body);
});

// 7. POST /api/partner/import-demo-bookings
partnerApiRouter.post('/partner/import-demo-bookings', async (req: Request, res: Response) => {
  const result = await importDemoBookings(req);
  res.status(result.statusCode).json(result.body);
});
