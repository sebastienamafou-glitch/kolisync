"use client";

import { useState, useEffect } from "react";
import { MapPin, ShieldCheck, AlertCircle } from "lucide-react";

export function GpsOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Vérifie si le livreur a déjà répondu à la demande sur cet appareil
    const status = localStorage.getItem("kolisync_gps_permission");
    if (!status) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setIsRequesting(true);
    if ("geolocation" in navigator) {
      // Déclenche la popup native iOS/Android
      navigator.geolocation.getCurrentPosition(
        () => {
          localStorage.setItem("kolisync_gps_permission", "granted");
          setIsVisible(false);
        },
        () => {
          // Si l'utilisateur refuse sur la popup native OS
          localStorage.setItem("kolisync_gps_permission", "denied");
          setIsVisible(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      localStorage.setItem("kolisync_gps_permission", "denied");
      setIsVisible(false);
    }
  };

  const handleDecline = () => {
    // Si l'utilisateur refuse directement sur notre UI
    localStorage.setItem("kolisync_gps_permission", "denied");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900 text-white">
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)]">
          <MapPin className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight">Localisation</h1>
        <p className="mt-4 text-lg font-medium text-slate-300">
          Votre protection en cas de litige client.
        </p>
        
        <div className="mt-8 space-y-4 text-sm text-slate-400">
          <p className="flex items-start gap-3 text-left">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            Nous enregistrons votre position uniquement au moment où vous validez une livraison sans code PIN.
          </p>
          <p className="flex items-start gap-3 text-left">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            Si vous refusez, vous ne pourrez pas forcer la livraison en cas de client injoignable.
          </p>
        </div>
      </div>

      <div className="space-y-3 p-6 pb-12">
        <button
          onClick={handleAccept}
          disabled={isRequesting}
          className="flex w-full items-center justify-center rounded-2xl bg-amber-400 px-4 py-4 text-lg font-black tracking-wide text-slate-900 shadow-lg active:scale-95 disabled:opacity-70"
        >
          {isRequesting ? "Autorisation en cours..." : "Autoriser l'accès GPS"}
        </button>
        <button
          onClick={handleDecline}
          disabled={isRequesting}
          className="flex w-full items-center justify-center rounded-2xl bg-slate-800 px-4 py-4 text-sm font-bold tracking-wide text-slate-400 active:bg-slate-700 disabled:opacity-70"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
