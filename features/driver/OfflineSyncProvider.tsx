"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, CloudDrizzle, Signal, SignalLow, SignalMedium } from "lucide-react";
import { getPendingEvents, removeOfflineEvent } from "@/lib/offline-store";
import { processOfflineQueueAction } from "@/app/actions/sync";
import { useNetworkQuality, NetworkType } from "@/hooks/useNetworkQuality";

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const networkType = useNetworkQuality();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  // 1. GESTION DU HORS-LIGNE & CRDT (À la reconnexion)
  useEffect(() => {
    if (networkType === "offline") return;

    const syncPendingEvents = async () => {
      setIsSyncing(true);
      try {
        const pendingEvents = await getPendingEvents();
        if (pendingEvents.length > 0) {
          const result = await processOfflineQueueAction(pendingEvents);
          if (result.success && result.processedIds) {
            for (const id of result.processedIds) {
              await removeOfflineEvent(id);
            }
            router.refresh();
          }
        }
      } catch {
        // Échec silencieux, restera dans IndexedDB
      } finally {
        setIsSyncing(false);
      }
    };

    syncPendingEvents();
  }, [networkType, router]);

  // 2. GESTION DU TEMPS RÉEL ADAPTATIF (SSE vs Polling)
  useEffect(() => {
    if (networkType === "offline") return;

    let eventSource: EventSource | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    if (networkType === "4g") {
      // Stratégie A : Server-Sent Events (Performance Max)
      eventSource = new EventSource("/api/events");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Si on reçoit un signal de mise à jour, on demande à Next.js de re-rendre la page
          if (data.type === "update") {
            router.refresh();
          }
        } catch {
          // Payload corrompu
        }
      };
    } else {
      // Stratégie B : Long-polling adaptatif pour économiser la data (3G/2G)
      const intervalMs = networkType === "3g" ? 15000 : 30000;
      pollingInterval = setInterval(() => {
        router.refresh();
      }, intervalMs);
    }

    // Cleanup
    return () => {
      if (eventSource) eventSource.close();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [networkType, router]);

  // Helpers pour l'affichage du badge réseau
  const isOffline = networkType === "offline";
  const showNetworkBadge = isOffline || isSyncing || networkType === "2g" || networkType === "slow-2g";

  return (
    <>
      {showNetworkBadge && (
        <div className="fixed left-0 right-0 top-0 z-[100] flex justify-center p-2 transition-all">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md ${
            isOffline ? "bg-slate-900/90 text-white" : 
            isSyncing ? "bg-amber-400/90 text-slate-900" : 
            "bg-orange-100 text-orange-800 ring-1 ring-orange-500/30"
          }`}>
            {isOffline ? (
              <>
                <CloudOff className="h-4 w-4 text-slate-400" />
                Hors-ligne. Synchronisation en pause.
              </>
            ) : isSyncing ? (
              <>
                <CloudDrizzle className="h-4 w-4 animate-bounce" />
                Synchronisation des livraisons...
              </>
            ) : (
              <>
                {networkType === "3g" ? <SignalMedium className="h-4 w-4" /> : <SignalLow className="h-4 w-4" />}
                Réseau lent. Mode économie d&apos;énergie.
              </>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
