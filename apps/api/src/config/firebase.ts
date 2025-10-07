import admin from 'firebase-admin';
import { getEnv } from './env.js';

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin.app();
  const env = getEnv();
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    if (env.ALLOW_INSECURE_AUTH === 'true') {
      initialized = true;
      return admin.initializeApp();
    }
    throw new Error('Firebase Admin env vars missing');
  }
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  initialized = true;
  return app;
}

export async function verifyIdToken(idToken: string) {
  initFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
}
