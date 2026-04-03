"use client";

import { useState, useEffect } from "react";

export type NetworkType = "4g" | "3g" | "2g" | "slow-2g" | "offline";

// Typage strict de l'API navigateur expérimentale
interface NetworkInformation extends EventTarget {
  effectiveType: NetworkType;
}

export function useNetworkQuality(): NetworkType {
  const [networkType, setNetworkType] = useState<NetworkType>("4g");

  useEffect(() => {
    // Si hors-ligne dès le montage
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setNetworkType("offline");
      return;
    }

    // Cast sécurisé pour accéder à l'API expérimentale
    const nav = navigator as unknown as {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    };
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    function updateNetworkQuality() {
      if (!navigator.onLine) {
        setNetworkType("offline");
        return;
      }
      if (connection && connection.effectiveType) {
        setNetworkType(connection.effectiveType);
      } else {
        setNetworkType("4g"); // Fallback Safari/iOS
      }
    }

    // Premier check
    updateNetworkQuality();

    // Écouteurs d'événements
    if (connection) {
      connection.addEventListener("change", updateNetworkQuality);
    }
    window.addEventListener("online", updateNetworkQuality);
    window.addEventListener("offline", updateNetworkQuality);

    return () => {
      if (connection) connection.removeEventListener("change", updateNetworkQuality);
      window.removeEventListener("online", updateNetworkQuality);
      window.removeEventListener("offline", updateNetworkQuality);
    };
  }, []);

  return networkType;
}
