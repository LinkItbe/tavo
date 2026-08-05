import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { RESTAURANTS } from "./src/data/mockData";
import { Reservation, ReservationStatus } from "./src/types";
import { partnerApiRouter } from "./src/server/apiRoutes";
import { seedFirestoreIfNeeded } from "./src/lib/seedFirestore";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", partnerApiRouter);

// In-memory server database for bookings
const serverBookings: Reservation[] = [
  {
    id: "res-sample-1",
    accessToken: "token_sample_1",
    confirmationCode: "TV-49281",
    reservationNumber: "TV-49281",
    venueId: "rest-1",
    restaurantId: "rest-1",
    venueNameSnapshot: "Osteria Cantina",
    restaurantName: "Osteria Cantina",
    venueAddressSnapshot: "ул. Революционная, 14",
    restaurantAddress: "ул. Революционная, 14",
    restaurantPhone: "+375 (29) 612-34-56",
    guestName: "Алексей Иванов",
    customerName: "Алексей Иванов",
    guestPhone: "+375 (29) 111-22-33",
    customerPhone: "+375 (29) 111-22-33",
    guestEmail: "alex@example.com",
    customerEmail: "alex@example.com",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    partySize: 2,
    comment: "Столик у окна",
    seatingPreference: ["У окна"],
    reservationMode: "instant",
    confirmationMode: "instant",
    status: "confirmed",
    notificationStatus: { email: "sent", telegram: "pending" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantPhoto: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
  },
];

// Map for single-use Telegram connection tokens
const telegramLinkTokens = new Map<string, { guestName?: string; phone?: string; createdAt: number }>();

// Helper: send email using Resend if key exists
async function sendBookingEmail(booking: Reservation, type: "created" | "cancelled") {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Tavoo <onboarding@resend.dev>";
  
  if (!booking.guestEmail) return "not_provided";

  const isConfirmed = booking.status === "confirmed";
  const title = type === "created" 
    ? (isConfirmed ? "Ваш столик забронирован!" : "Запрос на бронирование принят")
    : "Бронирование отменено";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EB; padding: 24px; border-radius: 16px; border: 1px solid #D8CFBE; color: #211E19;">
      <h1 style="color: #4F5328; margin-top: 0;">Tavoo</h1>
      <h2 style="color: #A64F2C; border-bottom: 2px solid #D8CFBE; padding-bottom: 8px;">${title}</h2>
      <p style="font-size: 16px; line-height: 1.5;">Здравствуйте, <strong>${booking.guestName}</strong>!</p>
      
      <div style="background: #FFFDF7; padding: 16px; border-radius: 12px; border: 1px solid #E2D9C8; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Код брони:</strong> <span style="color: #A64F2C; font-size: 18px; font-weight: bold;">${booking.confirmationCode}</span></p>
        <p style="margin: 4px 0;"><strong>Ресторан:</strong> ${booking.venueNameSnapshot}</p>
        <p style="margin: 4px 0;"><strong>Адрес:</strong> ${booking.venueAddressSnapshot}</p>
        <p style="margin: 4px 0;"><strong>Дата:</strong> ${booking.date}</p>
        <p style="margin: 4px 0;"><strong>Время:</strong> ${booking.time}</p>
        <p style="margin: 4px 0;"><strong>Количество гостей:</strong> ${booking.partySize}</p>
        ${booking.tableLabel ? `<p style="margin: 4px 0;"><strong>Стол:</strong> ${booking.tableLabel}</p>` : ''}
        ${booking.seatingPreference?.length ? `<p style="margin: 4px 0;"><strong>Предпочтение:</strong> ${booking.seatingPreference.join(', ')}</p>` : ''}
        ${booking.comment ? `<p style="margin: 4px 0;"><strong>Комментарий:</strong> ${booking.comment}</p>` : ''}
        <p style="margin: 4px 0;"><strong>Телефон ресторана:</strong> ${booking.restaurantPhone}</p>
      </div>

      <p style="font-size: 13px; color: #7C725F;">
        Управлять своими бронированиями вы можете на сайте Tavoo в разделе «Бронирования».
      </p>
    </div>
  `;

  if (!apiKey) {
    console.log(`[Email Dispatch Mock] Sent "${title}" to ${booking.guestEmail} for booking ${booking.confirmationCode}`);
    return "sent";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [booking.guestEmail],
        subject: `Tavoo: ${title} (${booking.venueNameSnapshot})`,
        html: htmlContent,
      }),
    });

    if (res.ok) {
      console.log(`[Resend Email] Successfully sent to ${booking.guestEmail}`);
      return "sent";
    } else {
      const errText = await res.text();
      console.error(`[Resend Email Error] ${res.status}: ${errText}`);
      return "failed";
    }
  } catch (err) {
    console.error("[Resend Email Exception]", err);
    return "failed";
  }
}

// Helper: send Telegram message to restaurant or venue manager
async function sendTelegramNotification(booking: Reservation, type: "created" | "cancelled") {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log(`[Telegram Bot Mock] Notification for venue ${booking.venueNameSnapshot}, code ${booking.confirmationCode}`);
    return "pending";
  }

  // Find venue telegramChatId
  const venue = RESTAURANTS.find(r => r.id === booking.venueId);
  const chatId = booking.telegramChatId || (venue as any)?.telegramChatId || process.env.TELEGRAM_DEFAULT_CHAT_ID;

  if (!chatId) return "pending";

  const statusText = booking.status === "confirmed" ? "Подтверждено" : "Ожидает подтверждения";
  const msg = type === "created" 
    ? `🔔 <b>Новая бронь Tavoo</b>\n\n` +
      `🏢 <b>Ресторан:</b> ${booking.venueNameSnapshot}\n` +
      `🔑 <b>Код:</b> ${booking.confirmationCode}\n` +
      `📅 <b>Дата:</b> ${booking.date} в ${booking.time}\n` +
      `👥 <b>Гости:</b> ${booking.partySize} чел.\n` +
      `👤 <b>Имя:</b> ${booking.guestName}\n` +
      `📞 <b>Тел:</b> ${booking.guestPhone}\n` +
      (booking.tableLabel ? `🪑 <b>Стол:</b> ${booking.tableLabel}\n` : '') +
      (booking.comment ? `💬 <b>Коммент:</b> ${booking.comment}\n` : '') +
      `📌 <b>Статус:</b> ${statusText}`
    : `❌ <b>Отмена бронирования Tavoo</b>\n\n` +
      `🏢 <b>Ресторан:</b> ${booking.venueNameSnapshot}\n` +
      `🔑 <b>Код:</b> ${booking.confirmationCode}\n` +
      `👤 <b>Гость:</b> ${booking.guestName} (${booking.guestPhone})\n` +
      `📅 <b>Было забронировано:</b> ${booking.date} в ${booking.time}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "HTML",
      }),
    });

    if (res.ok) {
      return "sent";
    }
  } catch (e) {
    console.error("[Telegram Error]", e);
  }
  return "failed";
}

// API Routes

// 1. GET /api/bookings
app.get("/api/bookings", (req, res) => {
  const idsQuery = req.query.ids as string;
  const tokenQuery = req.query.accessToken as string;
  const allQuery = req.query.all as string;

  if (allQuery === "true") {
    res.json({ success: true, bookings: serverBookings });
    return;
  }

  let filtered = serverBookings;

  if (idsQuery) {
    const idsList = idsQuery.split(",").map(i => i.trim());
    filtered = filtered.filter(b => idsList.includes(b.id) || idsList.includes(b.reservationNumber));
  } else if (tokenQuery) {
    filtered = filtered.filter(b => b.accessToken === tokenQuery);
  }

  res.json({ success: true, bookings: filtered });
});

// 2. GET /api/bookings/availability
app.get("/api/bookings/availability", (req, res) => {
  const venueId = req.query.venueId as string;
  const dateStr = req.query.date as string;
  const partySize = Number(req.query.partySize || 2);

  const venue = RESTAURANTS.find(r => r.id === venueId);
  if (!venue) {
    res.status(404).json({ success: false, error: "Заведение не найдено" });
    return;
  }

  const existing = serverBookings.filter(
    b => b.venueId === venueId && b.date === dateStr && b.status !== "cancelled" && b.status !== "rejected"
  );

  const slotCapacity = venue.slotCapacity || 6;
  const timeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];

  const availability = timeSlots.map(time => {
    const bookedAtSlot = existing.filter(b => b.time === time).length;
    const available = (slotCapacity - bookedAtSlot) > 0;
    return { time, available, remaining: Math.max(0, slotCapacity - bookedAtSlot) };
  });

  // Table availability
  const occupiedTableIds = existing.filter(b => b.tableId).map(b => b.tableId!);

  res.json({
    success: true,
    slots: availability,
    occupiedTableIds,
  });
});

// 3. POST /api/bookings
app.post("/api/bookings", async (req, res) => {
  const {
    venueId,
    date,
    time,
    partySize,
    tableId,
    tableLabel,
    seatingPreference,
    guestName,
    guestPhone,
    guestEmail,
    telegramChatId,
    comment,
  } = req.body;

  if (!venueId || !date || !time || !guestName || !guestPhone) {
    res.status(400).json({ success: false, error: "Пожалуйста, заполните все обязательные поля." });
    return;
  }

  const venue = RESTAURANTS.find(r => r.id === venueId);
  if (!venue) {
    res.status(404).json({ success: false, error: "Заведение не найдено." });
    return;
  }

  // Double check server availability
  const existingAtSlot = serverBookings.filter(
    b => b.venueId === venueId && b.date === date && b.time === time && b.status !== "cancelled" && b.status !== "rejected"
  );

  const slotCapacity = venue.slotCapacity || 6;
  if (existingAtSlot.length >= slotCapacity) {
    const nearest = ["18:30", "19:30", "20:00"].filter(t => t !== time);
    res.status(409).json({
      success: false,
      error: "Это время только что стало недоступно.",
      nearestSlots: nearest,
    });
    return;
  }

  // Check specific table availability
  if (tableId) {
    const tableBooked = existingAtSlot.some(b => b.tableId === tableId);
    if (tableBooked) {
      res.status(409).json({
        success: false,
        error: "Выбранный стол только что забронировали.",
      });
      return;
    }
  }

  const reservationMode = venue.reservationMode === "request" ? "request" : "instant";
  const initialStatus: ReservationStatus = reservationMode === "instant" ? "confirmed" : "pending";

  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const confirmationCode = `TV-${randomCode}`;
  const accessToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const bookingId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const photo = venue.photos && venue.photos.length > 0 
    ? venue.photos[0] 
    : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";

  const newBooking: Reservation = {
    id: bookingId,
    accessToken,
    confirmationCode,
    reservationNumber: confirmationCode,
    venueId: venue.id,
    restaurantId: venue.id,
    venueNameSnapshot: venue.name,
    restaurantName: venue.name,
    venueAddressSnapshot: venue.address || venue.district || "Минск",
    restaurantAddress: venue.address || venue.district || "Минск",
    restaurantPhone: venue.phone || "+375 (29) 111-22-33",
    guestName,
    customerName: guestName,
    guestPhone,
    customerPhone: guestPhone,
    guestEmail: guestEmail || "",
    customerEmail: guestEmail || "",
    telegramChatId,
    date,
    time,
    timezone: "Europe/Minsk",
    partySize: Number(partySize) || 2,
    tableId,
    tableLabel,
    seatingPreference: Array.isArray(seatingPreference) ? seatingPreference : seatingPreference ? [seatingPreference] : [],
    comment: comment || "",
    reservationMode,
    confirmationMode: reservationMode,
    status: initialStatus,
    notificationStatus: { email: "pending", telegram: "pending" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantPhoto: photo,
  };

  // Dispatch email notification
  const emailResult = await sendBookingEmail(newBooking, "created");
  const tgResult = await sendTelegramNotification(newBooking, "created");

  newBooking.notificationStatus = {
    email: emailResult as any,
    telegram: tgResult as any,
  };

  serverBookings.unshift(newBooking);

  res.status(201).json({
    success: true,
    booking: newBooking,
    accessToken,
  });
});

// 4. POST /api/bookings/:id/cancel
app.post("/api/bookings/:id/cancel", async (req, res) => {
  const { id } = req.params;
  const booking = serverBookings.find(b => b.id === id || b.confirmationCode === id);

  if (!booking) {
    res.status(404).json({ success: false, error: "Бронирование не найдено" });
    return;
  }

  booking.status = "cancelled";
  booking.updatedAt = new Date().toISOString();

  // Dispatch cancel notifications
  const emailRes = await sendBookingEmail(booking, "cancelled");
  const tgRes = await sendTelegramNotification(booking, "cancelled");

  if (booking.notificationStatus) {
    booking.notificationStatus.email = emailRes as any;
    booking.notificationStatus.telegram = tgRes as any;
  }

  res.json({
    success: true,
    booking,
  });
});

// 5. POST /api/telegram/generate-link
app.post("/api/telegram/generate-link", (req, res) => {
  const { guestName, phone } = req.body;
  const linkToken = `tavoo_link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  telegramLinkTokens.set(linkToken, { guestName, phone, createdAt: Date.now() });

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "TavooBookingBot";
  const telegramUrl = `https://t.me/${botUsername}?start=${linkToken}`;

  res.json({
    success: true,
    linkToken,
    telegramUrl,
    isBotConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
});

// 6. POST /api/telegram/webhook
app.post("/api/telegram/webhook", (req, res) => {
  const update = req.body;
  console.log("[Telegram Webhook Update]", JSON.stringify(update));
  res.json({ ok: true });
});

// Start Express Server
async function startServer() {
  await seedFirestoreIfNeeded();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tavoo Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
