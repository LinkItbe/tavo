import { adminDb } from './firebaseAdmin';

export async function seedFirestoreIfNeeded(): Promise<void> {
  try {
    const osteriaRef = adminDb.collection('restaurants').doc('osteria-cantina');
    await osteriaRef.set(
      {
        id: 'osteria-cantina',
        name: 'Osteria Cantina',
        category: 'restaurant',
        cuisine: 'Итальянская кухня',
        district: 'Центральный район',
        address: 'ул. Революционная, 14',
        averageCheck: 65,
        currency: 'BYN',
        bookingMode: 'instant',
        openingTime: '12:00',
        closingTime: '23:00',
        slotIntervalMinutes: 30,
        defaultVisitDurationMinutes: 120,
        active: true,
        pilotEnabled: true,
      },
      { merge: true }
    );

    const osteriaTables = [
      { id: 'osteria-table-1', name: 'Стол 1', zone: 'У окна', capacity: 2, active: true },
      { id: 'osteria-table-2', name: 'Стол 2', zone: 'Основной зал', capacity: 2, active: true },
      { id: 'osteria-table-3', name: 'Стол 3', zone: 'Основной зал', capacity: 4, active: true },
      { id: 'osteria-table-4', name: 'Стол 4', zone: 'Основной зал', capacity: 4, active: true },
      { id: 'osteria-table-5', name: 'Стол 5', zone: 'Большой стол', capacity: 6, active: true },
      { id: 'osteria-table-6', name: 'Стол 6', zone: 'Терраса', capacity: 4, active: true },
    ];

    for (const t of osteriaTables) {
      const tRef = osteriaRef.collection('tables').doc(t.id);
      const snap = await tRef.get();
      if (!snap.exists) {
        await tRef.set(t);
      }
    }

    const beansRef = adminDb.collection('restaurants').doc('mornings-and-beans');
    await beansRef.set(
      {
        id: 'mornings-and-beans',
        name: 'Mornings & Beans',
        category: 'restaurant',
        cuisine: 'Завтраки',
        district: 'Площадь Победы',
        address: 'пр-т Независимости, 37',
        averageCheck: 28,
        currency: 'BYN',
        bookingMode: 'manual',
        openingTime: '08:00',
        closingTime: '21:00',
        slotIntervalMinutes: 30,
        defaultVisitDurationMinutes: 90,
        active: true,
        pilotEnabled: true,
      },
      { merge: true }
    );

    const beansTables = [
      { id: 'beans-table-1', name: 'Стол 1', zone: 'У окна', capacity: 2, active: true },
      { id: 'beans-table-2', name: 'Стол 2', zone: 'У окна', capacity: 2, active: true },
      { id: 'beans-table-3', name: 'Стол 3', zone: 'Основной зал', capacity: 2, active: true },
      { id: 'beans-table-4', name: 'Стол 4', zone: 'Основной зал', capacity: 4, active: true },
      { id: 'beans-table-5', name: 'Стол 5', zone: 'Общий стол', capacity: 6, active: true },
    ];

    for (const t of beansTables) {
      const tRef = beansRef.collection('tables').doc(t.id);
      const snap = await tRef.get();
      if (!snap.exists) {
        await tRef.set(t);
      }
    }

    const systemRef = adminDb.collection('system').doc('partnerPilot');
    const systemSnap = await systemRef.get();
    if (!systemSnap.exists) {
      await systemRef.set({ claimedRestaurants: [] }, { merge: true });
    }

    console.log('[Firestore Seed] Seed completed successfully.');
  } catch (err) {
    console.error('[Firestore Seed Error]', err);
  }
}
