"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflineFallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-center text-white">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-800/50">
        <WifiOff className="h-12 w-12 text-amber-500" />
      </div>
      
      <h1 className="text-3xl font-black tracking-tight">Réseau perdu</h1>
      <p className="mt-2 max-w-sm text-slate-400">
        Vous êtes actuellement dans une zone sans couverture réseau. Vérifiez votre connexion 4G/3G.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {/* Un rechargement natif force le navigateur et le SW à retenter la requête réseau sur la page ACTUELLE */}
        <button 
          onClick={() => window.location.reload()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-4 text-sm font-bold text-slate-900 shadow-lg transition-transform active:scale-95"
        >
          <RefreshCw className="h-5 w-5" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
