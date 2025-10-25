import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

// Firebase config is read from Vite env vars. Create a .env.local file in frontend
// with the VITE_FIREBASE_* values from your Firebase project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function validateConfig(cfg: Record<string, any>) {
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = required.filter((k) => !cfg[k]);
  if (missing.length) {
    console.error("Missing Firebase config keys:", missing);
    throw new Error(`Missing Firebase config keys: ${missing.join(", ")}`);
  }
}

// Log the config (non-sensitive fields) to help debug CONFIGURATION_NOT_FOUND
try {
  validateConfig(firebaseConfig as any);
  // eslint-disable-next-line no-console
  console.info("firebaseConfig:", {
    apiKey: firebaseConfig.apiKey ? "(present)" : "(missing)",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId ?? "(none)",
  });
} catch (err) {
  // Re-throw so initialization does not proceed with a bad config
  // eslint-disable-next-line no-console
  console.error(err);
  throw err;
}

let app: ReturnType<typeof initializeApp>;
try {
  app = initializeApp(firebaseConfig as any);
} catch (err) {
  console.error("Failed to initialize Firebase:", err);
  throw err;
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize analytics only when measurementId is provided and when running in a browser
if (firebaseConfig.measurementId && typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      try {
        // eslint-disable-next-line no-console
        console.info("Initializing Firebase analytics");
        getAnalytics(app);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Analytics initialization failed:", err);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Failed to load firebase/analytics module:", err);
    });
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
};

export const signOutUser = async () => {
  try {
    return await signOut(auth);
  } catch (err) {
    console.error("Sign out error:", err);
    throw err;
  }
};

export const onAuthChanged = (cb: (u: User | null) => void) =>
  onAuthStateChanged(auth, cb);

export type { User };
