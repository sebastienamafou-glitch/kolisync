import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, Map, Wallet, LogOut, Globe,
  ShieldAlert, Clock, XCircle, ShieldCheck, Camera
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import HelmetReminder from "@/components/HelmetReminder";
import WhatsAppButton from "@/components/ui/WhatsAppButton"; // 🚨 Ajout de l'import

// 🚨 ON DÉSACTIVE TEMPORAIREMENT LES COMPOSANTS SUPPRIMÉS
// import { OfflineSyncProvider } from "@/components/features/OfflineSyncProvider";
// import { GpsOnboarding } from "@/components/features/GpsOnboarding";

export default async function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  // 1. Vérification de sécurité de base
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  // 2. Récupération du statut KYC
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { kycStatus: true, kycRejectionReason: true }
  });

  if (!user) redirect("/");

  // 3. 🟢 KYC VALIDÉ : On affiche ton layout PWA normal avec la Bottom Bar
  if (user.kycStatus === "APPROVED") {
    return (
      // <OfflineSyncProvider> // 🚨 Commenté temporairement
      <>
        <div className="flex h-screen flex-col bg-slate-50 font-sans relative">
          {/* <GpsOnboarding /> */} {/* 🚨 Commenté temporairement */}
          
          {/* 🚨 LE RAPPEL QUOTIDIEN DE SÉCURITÉ EST INJECTÉ ICI */}
          <HelmetReminder />
          
          {/* Contenu principal défilant */}
          <main className="flex-1 overflow-y-auto pb-20">
            {children}
          </main>

          {/* ── BARRE DE NAVIGATION INFÉRIEURE (BOTTOM BAR) ── */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 pb-safe pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <ul className="flex items-center justify-between">
              <li>
                <Link href="/pwa" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Package className="h-6 w-6" />
                  <span className="text-[10px] font-bold">Tournée</span>
                </Link>
              </li>
              
              <li>
                <Link href="/pwa/opportunities" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Globe className="h-6 w-6" />
                  <span className="text-[10px] font-bold">Bourse</span>
                </Link>
              </li>

              <li>
                <Link href="/pwa/wallet" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Wallet className="h-6 w-6" />
                  <span className="text-[10px] font-bold">Wallet</span>
                </Link>
              </li>

              <li>
                <Link href="/pwa/map" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <Map className="h-6 w-6" />
                  <span className="text-[10px] font-bold">Carte</span>
                </Link>
              </li>
              
              <li>
                <form action={logoutAction}>
                  <button type="submit" className="flex flex-col items-center gap-1 p-2 text-red-400 hover:text-red-600 transition-colors">
                    <LogOut className="h-6 w-6" />
                    <span className="text-[10px] font-bold">Quitter</span>
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </div>
        {/* 🚨 Bouton WhatsApp pour l'assistance terrain */}
        <WhatsAppButton />
      </>
      // </OfflineSyncProvider>
    );
  }

  // 4. 🔴 BOUCLIER KYC : Écrans de blocage selon l'état
  return (
    <>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/20 px-6 py-12 justify-center relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(circle at 50% 30%, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-sm mx-auto text-center space-y-6">
          
          {/* EN ATTENTE */}
          {user.kycStatus === "PENDING" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="h-24 w-24 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <Clock className="h-10 w-10 text-cyan-400 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Vérification en cours</h1>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Notre équipe examine actuellement votre pièce d'identité et votre selfie. Cette opération prend généralement moins de 24h.
              </p>
            </div>
          )}

          {/* REFUSÉ */}
          {user.kycStatus === "REJECTED" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="h-24 w-24 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Dossier refusé</h1>
              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-4">
                Votre vérification a échoué. Le Radar et le Wallet sont bloqués.
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Motif de l'administrateur</p>
                <p className="text-sm font-semibold text-red-200">{user.kycRejectionReason || "Documents non conformes ou flous."}</p>
              </div>
              <Link href="/pwa/kyc-upload" className="w-full py-4 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Camera className="h-4 w-4" /> Soumettre à nouveau
              </Link>
            </div>
          )}

          {/* NON VÉRIFIÉ */}
          {user.kycStatus === "UNVERIFIED" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="h-24 w-24 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <ShieldAlert className="h-10 w-10 text-amber-500" />
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Identité requise</h1>
              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                Pour accéder aux colis et collecter des paiements, vous devez prouver votre identité. Préparez votre CNI.
              </p>
              <Link href="/pwa/kyc-upload" className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-amber-500/20">
                <ShieldCheck className="h-4 w-4" /> Démarrer le KYC
              </Link>
            </div>
          )}

          <form action={logoutAction} className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
            <button type="submit" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 mx-auto">
              <LogOut className="h-3 w-3" /> Se déconnecter
            </button>
          </form>

        </div>
      </div>
      {/* 🚨 Bouton WhatsApp pour l'assistance d'inscription / KYC */}
      <WhatsAppButton />
    </>
  );
}
