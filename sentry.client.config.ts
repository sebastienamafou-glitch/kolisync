import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Optimisation du Quota : On capture 100% des erreurs, mais on échantillonne 
  // les traces de performance (vitesse de chargement) à 10%.
  tracesSampleRate: 0.1,

  // Fonctionnalité "Replay" : Enregistre l'écran de l'utilisateur.
  // On ne le déclenche à 100% QUE si une erreur survient (KISS & Économie).
  replaysOnErrorSampleRate: 1.0,
  
  // On capture 1% des sessions normales pour auditer l'UX occasionnellement.
  replaysSessionSampleRate: 0.01,

  integrations: [
    Sentry.replayIntegration({
      // RGPD / Confidentialité : Sentry va masquer tout le texte et les images 
      // de la PWA (noms des clients, montants, photos KYC) sur les vidéos.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
