import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function initFirebaseAdmin() {
  if (!getApps().length) {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Fallback for local dev to avoid crashes
      initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    }
  }
  return { auth: getAuth(), db: getFirestore() };
}

export async function verifyAdminFromRequest(req: Request) {
  const { auth } = initFirebaseAdmin();
  const header =
    (req.headers as any).get?.('authorization') ||
    (req as any).headers?.authorization ||
    '';
  if (!header.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing bearer token');
  }
  const token = header.slice('Bearer '.length);
  const decoded = await auth.verifyIdToken(token);

  // Owner email check as minimum gate
  const owner = process.env.NEXT_PUBLIC_OWNER_EMAIL;
  if (
    owner &&
    decoded.email &&
    decoded.email.toLowerCase() === owner.toLowerCase()
  ) {
    return decoded;
  }
  // Allow admin claim if set
  if ((decoded as any).admin === true) return decoded;

  throw new Error('Forbidden: admin access required');
}
