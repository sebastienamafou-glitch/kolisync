import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Zap, ShieldCheck, ArrowRight, CreditCard, Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createSubscriptionPaymentAction } from "@/app/actions/payment";

export const metadata: Metadata = {
  title: "Passer Pro | KoliSync",
  description: "Débloquez la puissance totale de KoliSync pour développer votre boutique sans aucune limite.",
};

export default async function UpgradePage() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    redirect("/");
  }

  // 1. Récupération des statistiques du Tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: {
      isPro: true,
      _count: { select: { orders: true } },
    },
  });

  if (!tenant) {
    redirect("/b2b");
  }

  const orderCount = tenant._count.orders;
  const isLimitReached = orderCount >= 30;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* ── HEADER ── */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
            Passez à la vitesse supérieure
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Vous avez utilisé <strong className="text-slate-900">{orderCount} colis</strong> sur votre quota gratuit. 
            Débloquez la puissance totale de KoliSync pour développer votre boutique sans aucune limite.
          </p>
        </header>

        {tenant.isPro ? (
          /* ── ÉTAT PRO ACTIF ── */
          <div className="rounded-3xl bg-emerald-500/10 p-12 text-center ring-1 ring-emerald-500/20 max-w-2xl mx-auto">
            <ShieldCheck className="mx-auto h-20 w-20 text-emerald-500 mb-6" />
            <h2 className="text-2xl font-black text-emerald-700 mb-2">Abonnement PRO Actif</h2>
            <p className="text-emerald-600/80 font-medium mb-8">
              Votre boutique bénéficie de toutes les fonctionnalités premium et d&apos;un nombre illimité d&apos;expéditions.
            </p>
            <Link 
              href="/b2b" 
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-colors"
            >
              Retour au tableau de bord <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* ── GRILLES DE PRIX ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* PLAN GRATUIT */}
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 flex flex-col opacity-75">
              <h3 className="text-xl font-black text-slate-900 mb-2">Plan Découverte</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">0 FCFA<span className="text-sm text-slate-500 font-medium"> /à vie</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                  Jusqu&apos;à 30 colis inclus
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                  1 compte Livreur
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                  Tableau de bord basique
                </li>
              </ul>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <span className="text-slate-500">Consommation</span>
                  <span className={isLimitReached ? "text-red-500" : "text-slate-900"}>{orderCount} / 30</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isLimitReached ? "bg-red-500" : "bg-slate-900"}`} 
                    style={{ width: `${Math.min((orderCount / 30) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* PLAN PRO */}
            <div className="rounded-3xl bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-800 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap className="h-32 w-32 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                  Recommandé
                </span>
                <h3 className="text-xl font-black text-white mb-2">Plan PRO</h3>
                <div className="text-4xl font-black text-white mb-6">10 000 FCFA<span className="text-sm text-slate-400 font-medium"> /mois</span></div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Création de colis <strong className="text-white">Illimitée</strong>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Accès à la Bourse Globale
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Gestion d&apos;équipe & réconciliation
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Support prioritaire HQ
                  </li>
                </ul>

                {/* ── CTA PAIEMENT BRANCHÉ SUR L'ACTION SERVEUR ── */}
                <form action={async (formData: FormData) => {
                  "use server";
                  await createSubscriptionPaymentAction(formData);
                }}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg hover:bg-blue-500 transition-all active:scale-[0.98]">
                    <CreditCard className="h-5 w-5" />
                    Activer KoliSync PRO
                  </button>
                </form>
                <p className="mt-4 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                  <Lock className="h-3 w-3" /> Paiement sécurisé par Paystack (Mobile Money / Carte)
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
