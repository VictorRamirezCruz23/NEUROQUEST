import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

/**
 * firebaseConfig.js — Configuración centralizada e inicialización del SDK modular de Firebase.
 * Lee desde variables de entorno Vite con fallback seguro a las credenciales oficiales del proyecto.
 * Configura Firestore con auto-detección y polling resiliente para evitar bloqueos por adblockers
 * y desconexiones en canales terminados (net::ERR_BLOCKED_BY_CLIENT / TYPE=terminate).
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDHLgMt2WloB3LC3EAgJffwKh5NW8p7qXo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "neuroquest-game.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "neuroquest-game",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "neuroquest-game.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "782159607734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:782159607734:web:ba2b8f05fbd27ab377b317",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NS630G3P7P"
};

// 1. Inicializar Firebase App
export const app = initializeApp(firebaseConfig);

// 2. Inicializar Firebase Authentication
export const auth = getAuth(app);

// 3. Inicializar Cloud Firestore con transporte resiliente
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
});

// 4. Inicializar Cloud Functions
export const functions = getFunctions(app);

// 5. Inicializar Firebase Analytics de forma segura si no está bloqueado por extensiones
export let analytics = null;
if (typeof window !== 'undefined') {
  try {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('[Firebase] Analytics inicializado correctamente.');
      }
    }).catch(() => {
      // Silenciar bloqueo de adblocker de Analytics
    });
  } catch (e) {
    // Silenciar error de Analytics bloqueado
  }
}
