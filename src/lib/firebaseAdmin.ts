import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminAppInstance: App | null = null;
let initError: string | null = null;

function initFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;

  // 1. Try environment variables cert first
  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (e: any) {
      console.warn('[firebaseAdmin] Failed to initialize with cert env vars:', e?.message || e);
    }
  }

  // 2. Try firebase-applet-config.json file
  let config: any = {};
  try {
    const raw = readFileSync(join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    // File not present or unreadable
  }

  const effectiveProjectId = projectId || config.projectId;

  try {
    return initializeApp({
      projectId: effectiveProjectId,
    });
  } catch (e: any) {
    initError = e?.message || 'Failed to initialize Firebase Admin';
    console.error('[firebaseAdmin] Initialization failed:', initError);
    throw new Error(initError);
  }
}

export function getAdminApp(): App {
  if (!adminAppInstance) {
    adminAppInstance = initFirebaseAdmin();
  }
  return adminAppInstance;
}

export function getAdminServices(): { auth: Auth; db: Firestore } {
  const app = getAdminApp();
  const auth = getAuth(app);

  let config: any = {};
  try {
    const raw = readFileSync(join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    // Ignore
  }

  const db = config.firestoreDatabaseId
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

  return { auth, db };
}

// Export proxies / lazy getters for compatibility
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const { auth } = getAdminServices();
    const value = (auth as any)[prop];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const { db } = getAdminServices();
    const value = (db as any)[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});
