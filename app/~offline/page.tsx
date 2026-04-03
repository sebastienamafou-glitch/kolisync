import { WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";

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

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        {/* Le rechargement de la page relancera l'appel réseau via le SW */}
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-4 text-sm font-bold text-slate-900 shadow-lg active:scale-95 transition-transform"
        >
          <RefreshCw className="h-5 w-5" />
          Réessayer
        </Link>
      </div>
    </div>
  );
}
