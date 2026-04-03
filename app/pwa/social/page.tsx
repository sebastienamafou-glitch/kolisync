import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  History, 
  PlusCircle, 
  MinusCircle, 
  Info,
  Calendar
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { SocialTransactionType } from "@prisma/client";

// Helper pour le formatage monétaire conforme aux standards ivoiriens 
function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function SocialDetailsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  // Récupération du portefeuille avec l'historique des 50 dernières transactions 
  const wallet = await prisma.socialWallet.findUnique({
    where: { userId: session.userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { order: { select: { id: true, customerName: true } } }
      }
    }
  });

  const balance = wallet?.balance || 0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      
      {/* ── En-tête de navigation ── */}
      <header className="mb-6 flex items-center gap-4 pt-2">
        <Link 
          href="/pwa" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ma Prévoyance</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compte Social KoliSync</p>
        </div>
      </header>

      {/* ── Carte de Solde (Design Premium) ── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Solde Accumulé
          </div>
          <p className="text-4xl font-black tracking-tighter">
            {formatFCFA(balance)}
          </p>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-md">
            <Info className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-medium leading-tight text-slate-300">
              Fonds destinés à votre couverture santé, accident et retraite (CNPS/RSTI).
            </p>
          </div>
        </div>
      </section>

      {/* ── Historique des cotisations ── */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <History className="h-4 w-4" />
            Historique
          </h2>
          <span className="text-[10px] font-bold text-slate-400">50 derniers mouvements</span>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-12 text-center ring-1 ring-slate-200">
              <Calendar className="mx-auto h-8 w-8 text-slate-200" />
              <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune cotisation</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tx.type === SocialTransactionType.CONTRIBUTION 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {tx.type === SocialTransactionType.CONTRIBUTION ? (
                      <PlusCircle className="h-5 w-5" />
                    ) : (
                      <MinusCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {tx.type === SocialTransactionType.CONTRIBUTION ? "Cotisation Course" : "Reversement Institution"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {tx.order ? `Colis : ${tx.order.customerName}` : tx.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${
                    tx.type === SocialTransactionType.CONTRIBUTION ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {tx.type === SocialTransactionType.CONTRIBUTION ? "+" : "-"}{tx.amount} F
                  </p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase">
                    {tx.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Note d'information ── */}
      <footer className="mt-8 rounded-3xl bg-slate-100 p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Comment ça marche ?</h3>
        <ul className="mt-4 space-y-3">
          {[
            "100 FCFA sont prélevés sur chaque course livrée.",
            "Les fonds sont accumulés sur votre portefeuille virtuel KoliSync.",
            "KoliSync facilite le reversement groupé vers la CNPS/Assureurs partenaires."
          ].map((text, i) => (
            <li key={i} className="flex gap-3 text-[11px] font-medium leading-snug text-slate-500">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              {text}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
