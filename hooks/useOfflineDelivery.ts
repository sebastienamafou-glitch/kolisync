"use client";

import { useState } from "react";
import { useNetworkQuality } from "./useNetworkQuality";
import { saveOfflineEvent, OfflineSyncEvent } from "@/lib/offline-store";

type ValidateDeliveryAction = (orderId: string, pin: string) => Promise<{ error?: string; success?: boolean }>;

// 🚨 NOUVEAU : Typage strict de la réponse attendue par le formulaire
export interface OfflineDeliveryResult {
  success?: boolean;
  error?: string;
  isOffline: boolean;
}

export function useOfflineDelivery(serverAction: ValidateDeliveryAction) {
  const network = useNetworkQuality();
  const [isProcessing, setIsProcessing] = useState(false);

  // 🚨 On force la fonction à respecter l'interface OfflineDeliveryResult
  const executeDelivery = async (orderId: string, pin: string): Promise<OfflineDeliveryResult> => {
    setIsProcessing(true);

    try {
      if (network === "offline" || network === "slow-2g") {
        // 🔴 MODE DÉGRADÉ
        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `offline-${Date.now()}`;

        const syncEvent: OfflineSyncEvent = {
          id: eventId,
          orderId,
          actionType: "DELIVERY_PIN",
          payload: pin,
          logicalTs: Date.now(),
          timestamp: Date.now()
        };

        await saveOfflineEvent(syncEvent);

        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          const syncManager = (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync;
          await syncManager.register('sync-deliveries').catch(console.error);
        }

        setIsProcessing(false);
        return { success: true, isOffline: true };
      } else {
        // 🟢 MODE NORMAL
        const result = await serverAction(orderId, pin);
        setIsProcessing(false);
        return { 
          success: result.success, 
          error: result.error, 
          isOffline: false 
        };
      }
    } catch (error) {
      console.error("Erreur OfflineDelivery:", error);
      setIsProcessing(false);
      // 🚨 CORRECTION : On inclut "isOffline" même dans le bloc d'erreur pour uniformiser le type
      return { 
        error: "Une erreur critique est survenue lors du traitement.", 
        isOffline: false 
      };
    }
  };

  return {
    executeDelivery,
    isProcessing,
    isOfflineMode: network === "offline" || network === "slow-2g"
  };
}
