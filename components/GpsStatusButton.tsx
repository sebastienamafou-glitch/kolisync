"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { PackageStatus } from "@prisma/client";
import { updateStatusWithGpsAction } from "@/app/actions/tracking";

interface GpsStatusButtonProps {
  orderId: string;
  targetStatus: PackageStatus;
  label: string;
  colorClass?: string;
}

export function GpsStatusButton({ 
  orderId, 
  targetStatus, 
  label, 
  colorClass = "bg-slate-900 hover:bg-slate-800" 
}: GpsStatusButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    setIsPending(true);
    setError(null);

    // 1. Appel de l'API native du téléphone pour obtenir le GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // 2. Succès : On envoie les coordonnées exactes
          const { latitude, longitude } = position.coords;
          const res = await updateStatusWithGpsAction(orderId, targetStatus, latitude, longitude);
          if (res.error) setError(res.error);
          setIsPending(false);
        },
        async (err) => {
          // 3. Échec (Refus du livreur ou pas de signal) : On met à jour SANS les coordonnées
          console.warn("GPS désactivé ou refusé :", err.message);
          const res = await updateStatusWithGpsAction(orderId, targetStatus, null, null);
          if (res.error) setError(res.error);
          setIsPending(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options pour forcer la précision
      );
    } else {
      // Navigateur non compatible
      updateStatusWithGpsAction(orderId, targetStatus, null, null).then(() => setIsPending(false));
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleUpdate}
        disabled={isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${colorClass}`}
      >
        {isPending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Localisation...</>
        ) : (
          <><MapPin className="h-5 w-5" /> {label}</>
        )}
      </button>
      {error && <p className="mt-2 text-center text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}
