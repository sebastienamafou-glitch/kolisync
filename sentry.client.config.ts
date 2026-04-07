import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Optimisation du Quota : On capture 100% des erreurs, mais on échantillonne 
  // les traces de performance (vitesse de chargement) à 10%.
  tracesSampleRate: 0.1,

  // 🚨 CORRECTION : On désactive totalement les fonctionnalités Session Replay 
  // qui font crasher l'hydratation React en Navigation Privée stricte.
  /*
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  */
});
