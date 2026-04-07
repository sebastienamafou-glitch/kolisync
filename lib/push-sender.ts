import webpush from "web-push";
import prisma from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@kolisync.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  });

  if (subscriptions.length === 0) return;

  const pushPromises = subscriptions.map(async (sub) => {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    };

    try {
      await webpush.sendNotification(pushConfig, JSON.stringify({
        ...payload,
        url: payload.url || `/pwa`
      }));
    } catch (error: unknown) {
      // 🚨 CORRECTION TS : Type Narrowing strict sans utiliser "any"
      const isWebPushError = error && typeof error === 'object' && 'statusCode' in error;
      
      if (isWebPushError && (error as { statusCode: number }).statusCode === 410) {
        // L'utilisateur a révoqué l'accès, on nettoie la BDD
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error(`Échec de l'envoi Push pour l'abo ${sub.id}:`, error);
      }
    }
  });

  await Promise.allSettled(pushPromises);
}
