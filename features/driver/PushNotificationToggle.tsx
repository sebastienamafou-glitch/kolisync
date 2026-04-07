"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, AlertCircle } from "lucide-react";
import { usePushSubscription } from "@/hooks/usePushSubscription";

export default function PushNotificationToggle() {
  const { subscribe, isSubscribed, permission } = usePushSubscription();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Évite les erreurs d'hydratation entre le serveur et le client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // 1. Si le livreur est déjà abonné, on cache la bannière (UI Clean)
  if (isSubscribed || permission === "granted") {
    return null;
  }

  // 2. Si le livreur a cliqué sur "Bloquer" dans son navigateur
  if (permission === "denied") {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200 mt-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <p className="text-xs font-bold text-red-900 leading-relaxed">
          Notifications bloquées. Veuillez les autoriser dans les paramètres de votre navigateur (le petit cadenas dans l'URL) pour recevoir les alertes de courses.
        </p>
      </div>
    );
  }

  // 3. État normal : On l'incite à s'abonner
  const handleSubscribe = async () => {
    setIsLoading(true);
    await subscribe();
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-200 shadow-inner mt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black text-blue-900 leading-none">Courses en direct</p>
          <p className="text-[10px] font-bold text-blue-700 mt-1 uppercase tracking-widest">Recommandé</p>
        </div>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white active:scale-95 transition-transform disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer"}
      </button>
    </div>
  );
}
