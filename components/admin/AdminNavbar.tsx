import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export default function AdminNavbar() {
  const nowStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-gray-950/85 backdrop-blur-2xl">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Logo & Marque */}
        <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1">
            <Image
              src="/logo.png"
              alt="Logo KoliSync HQ"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
          <span className="f-display text-base font-bold text-white">KoliSync</span>
          <span className="f-mono text-[9px] font-bold uppercase tracking-[.2em] rounded border border-cyan-500/15 text-cyan-500/50 px-1.5 py-0.5">HQ</span>
        </Link>

        {/* Statut & Déconnexion */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex flex-col items-end">
            <span className="f-mono text-[11px] text-slate-400">{nowStr}</span>
            <span className="f-mono text-[9px] text-slate-600 capitalize">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-800/40 bg-emerald-950/50 px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="f-mono text-[10px] font-bold tracking-widest text-emerald-400">LIVE</span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden font-medium md:inline">Déconnexion</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
