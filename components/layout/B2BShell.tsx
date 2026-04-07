"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  Settings,
  LogOut,
  Zap,
  TrendingUp,
  Menu,
  AlertTriangle,
  Lock
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { SoftLockState } from "@/lib/soft-lock";

interface B2BShellProps {
  children: React.ReactNode;
  softLockState: SoftLockState;
  userName: string;
  userInitials: string;
}

interface SidebarProps {
  closeMobileMenu?: () => void;
  softLockState: SoftLockState;
  userName: string;
  userInitials: string;
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function SidebarContent({
  closeMobileMenu,
  softLockState,
  userName,
  userInitials,
}: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Tableau de bord", href: "/b2b", icon: LayoutDashboard },
    { name: "Colis & Expéditions", href: "/b2b/packages", icon: Package },
    { name: "Paramètres", href: "/b2b/settings", icon: Settings },
  ];

  const quotaPercent = "quotaUsed" in softLockState
    ? Math.min(Math.round((softLockState.quotaUsed / softLockState.quotaMax) * 100), 100)
    : 0;
  const quotaColor = quotaPercent >= 100 ? "bg-red-500" : quotaPercent >= 70 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white shadow-2xl">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700/60 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
          <Zap className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-white">
          Koli<span className="text-amber-400">Sync</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>

        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? "text-amber-400" : "group-hover:text-amber-400"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Zone Soft-Lock & Abonnement */}
      <div className="mx-4 mb-4">
        {softLockState.status === "PRO" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Plan Pro Actif</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Expéditions illimitées.
            </p>
          </div>
        )}

        {softLockState.status === "ACTIVE" && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Quota</span>
              <span className={`text-xs font-bold ${quotaPercent >= 90 ? "text-red-400" : "text-amber-400"}`}>
                {softLockState.quotaUsed}/{softLockState.quotaMax}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div className={`h-full rounded-full transition-all ${quotaColor}`} style={{ width: `${quotaPercent}%` }} />
            </div>
          </div>
        )}

        {softLockState.status === "WARNING" && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{softLockState.daysLeft} jours restants</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              <strong className="text-white">{formatFCFA(softLockState.lockedAmount)}</strong> en attente de réconciliation.
            </p>
            <Link href="/b2b/upgrade" onClick={closeMobileMenu} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
              <TrendingUp className="h-3.5 w-3.5" /> Passer Pro
            </Link>
          </div>
        )}

        {softLockState.status === "LOCKED" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-red-400">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Accès restreint</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              <strong className="text-white">{formatFCFA(softLockState.lockedAmount)}</strong> bloqués. Abonnement requis.
            </p>
            <Link href="/b2b/upgrade" onClick={closeMobileMenu} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
              Débloquer
            </Link>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-700/60 p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
            {userInitials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-[11px] text-slate-500">Abidjan, CI</p>
          </div>
        </div>
        <form action={logoutAction} className="w-full">
          <button type="submit" className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="mr-3 h-4 w-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}

export function B2BShell({ children, softLockState, userName, userInitials }: B2BShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="hidden w-64 shrink-0 md:block">
        <SidebarContent softLockState={softLockState} userName={userName} userInitials={userInitials} />
      </aside>

      {/* 🚨 CORRECTION : Rendu Conditionnel Strict (Hard Mount) */}
      <div className="md:hidden">
        {isMobileMenuOpen && (
          <div className="relative z-[9999]">
            {/* Voile sombre cliquable */}
            <div 
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            {/* Menu Physique avec animation CSS native */}
            <aside 
              className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl"
              style={{ animation: 'slideMenuIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <style>{`
                @keyframes slideMenuIn {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(0); }
                }
              `}</style>
              <SidebarContent closeMobileMenu={() => setIsMobileMenuOpen(false)} softLockState={softLockState} userName={userName} userInitials={userInitials} />
            </aside>
          </div>
        )}
      </div>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            
            {/* 🚨 BOUTON SÉCURISÉ : type="button" et pointer-events-none sur le SVG */}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(true)} 
              className="relative z-50 cursor-pointer rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            >
              <Menu className="h-6 w-6 pointer-events-none" />
              <span className="sr-only">Ouvrir le menu</span>
            </button>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">Espace Vendeur</h2>
              <p className="hidden text-xs text-slate-400 sm:block">Bienvenue, bonne journée 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {userInitials}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
