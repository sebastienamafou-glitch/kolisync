import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import prismaAdmin from "@/lib/prisma-admin"; // 🚨 On utilise l'admin pour le worker asynchrone

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. On récupère la session AVANT de démarrer le flux
  const session = await getSession();
  
  if (!session || !session.tenantId) {
    return new Response("Non autorisé", { status: 401 });
  }

  // 2. On stocke le tenantId dans une variable isolée pour le setInterval
  const currentTenantId = session.tenantId;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Gère la fermeture silencieuse
        }
      };

      sendEvent({ type: "ping", message: "Connecté au flux KoliSync" });

      let lastCheck = new Date();

      const interval = setInterval(async () => {
        try {
          // 🚨 FIX : On utilise prismaAdmin ET on filtre manuellement par tenantId.
          // Le middleware classique ne peut pas lire les headers dans un setInterval.
          const recentEventsCount = await prismaAdmin.packageEvent.count({
            where: { 
              tenantId: currentTenantId, // Isolation Multi-Tenant manuelle
              createdAt: { gt: lastCheck } 
            }
          });

          if (recentEventsCount > 0) {
            lastCheck = new Date();
            sendEvent({ type: "update", count: recentEventsCount });
          } else {
            sendEvent({ type: "heartbeat" }); 
          }
        } catch (error) {
          console.error("[SSE] Erreur de vérification:", error);
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
