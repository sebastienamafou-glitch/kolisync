// lib/sms.ts

/**
 * Service de Notification SMS (Mock / Webhook générique)
 * * En développement (sans SMS_PROVIDER_URL) : Affiche dans la console.
 * En production (avec SMS_PROVIDER_URL) : Envoie une requête POST (JSON) au fournisseur.
 */
export async function sendDeliveryPinSMS(
  phone: string, 
  customerName: string, 
  pin: string, 
  trackingId: string
) {
  const providerUrl = process.env.SMS_PROVIDER_URL;
  const providerKey = process.env.SMS_PROVIDER_KEY;
  
  // URL de base (ex: https://kolisync.com en production)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackingLink = `${appUrl}/track/${trackingId}`;

  // Formatage optimisé pour WhatsApp (avec du gras *) et SMS
  const messageText = 
    `📦 *KoliSync* - Bonjour ${customerName},\n\n` +
    `Votre colis est prêt et vous a été assigné !\n\n` +
    `📍 Suivez son avancée en temps réel ici :\n${trackingLink}\n\n` +
    `🔐 *VOTRE CODE PIN : ${pin}*\n` +
    `(Ne le donnez au livreur qu'au moment d'avoir le colis en main).\n\n` +
    `Merci pour votre confiance !`;

  try {
    // ── 1. MODE PRODUCTION (Appel API Réel) ──
    if (providerUrl) {
      const response = await fetch(providerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": providerKey ? `Bearer ${providerKey}` : "",
          // Certains fournisseurs locaux préfèrent 'api-key' ou 'x-api-key' au lieu de Bearer.
          // À ajuster selon la documentation de ton futur partenaire.
        },
        body: JSON.stringify({
          destinations: [phone],
          message: messageText,
          senderId: "KoliSync" // Le nom qui s'affichera sur le téléphone du client
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API SMS : ${response.status} ${response.statusText}`);
      }

      console.log(`[SMS/WHATSAPP ENVOYÉ EN PRODUCTION] Vers : ${phone}`);
      return { success: true };
    }

    // ── 2. MODE DÉVELOPPEMENT (Mock Console) ──
    // On simule le temps de latence d'un réseau (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("\n==========================================");
    console.log("📱 [MOCK SMS / WHATSAPP LOCAL]");
    console.log(`DESTINATAIRE : ${phone}`);
    console.log(`MESSAGE      :\n${messageText}`);
    console.log("==========================================\n");

    return { success: true };

  } catch (error) {
    console.error("❌ Erreur critique lors de l'envoi du SMS :", error);
    // On ne fait pas planter l'application si le SMS échoue, on retourne juste false.
    return { success: false, error: "Échec de l'envoi du SMS" };
  }
}

// 🚨 Stub générique utilisé par le module KYC (Admin)
export async function sendSMS(phone: string, message: string) {
  console.log("\n==========================================");
  console.log("📱 [MOCK SMS GÉNÉRIQUE (KYC)]");
  console.log(`DESTINATAIRE : ${phone}`);
  console.log(`MESSAGE      : ${message}`);
  console.log("==========================================\n");
  
  return { success: true };
}
