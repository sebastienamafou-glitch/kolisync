import { redirect } from "next/navigation";
import { 
  MapPin, 
  Banknote, 
  ShieldAlert, 
  ChevronLeft, 
  Zap,
  ShieldCheck,
  Wallet,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { claimOpportunityAction } from "@/app/actions/marketplace";

// ── COMPOSANT D'ALERTE LOCAL ─────────────────────────────────
// Intégré ici pour respecter KISS, car il n'est utilisé que sur cette page.
function DepositWarningCard({ currentBalance, requiredDeposit }: { currentBalance: number, requiredDeposit: number }) {
  const missingAmount = requiredDeposit - currentBalance;
  const formatFCFA = (amount: number) => new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

  return (
    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2rem] flex flex-col gap-5 w-full">
      <div className="flex items-start gap-4">
        <div className="bg-red-500/20 p-3 rounded-2xl text-red-400 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1.5">
            Solde Insuffisant
          </h4>
          <p className="text-sm font-medium text-slate-300 leading-relaxed">
            Il vous manque <strong className="text-white">{formatFCFA(missingAmount)}</strong> pour couvrir la caution.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-red-500/10">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <Wallet className="h-4 w-4" />
          Solde Actuel
        </div>
        <div className="text-sm font-black text-white">
          {formatFCFA(currentBalance)}
        </div>
      </div>

      <Link 
        href="/pwa/wallet" 
        className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        Recharger mon compte <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ── PAGE PRINCIPALE ──────────────────────────────────────────
export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") redirect("/");

  // 1. Requête parallèle optimisée : On récupère la commande ET le portefeuille en même temps
  const [order, wallet] = await Promise.all([
    prisma.order.findUnique({
      where: { id: id, isPublic: true },
    }),
    prisma.socialWallet.findUnique({
      where: { userId: session.userId }
    })
  ]);

  if (!order || order.driverId) redirect("/pwa");

  // 2. Calcul des fonds disponibles
  const requiredDeposit = order.depositAmount || 0;
  const currentBalance = wallet?.balance || 0;
  const hasEnoughFunds = currentBalance >= requiredDeposit;

  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/pwa/opportunities" className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors">
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Opportunité</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <section className="aspect-video w-full rounded-[2.5rem] bg-slate-200 overflow-hidden relative border-4 border-white shadow-sm">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
             <MapPin className="h-12 w-12 mb-2 text-slate-300" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">{order.commune || "Zone Abidjan"}</p>
          </div>
          <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl">
             <p className="text-[10px] font-black uppercase text-emerald-400 leading-none mb-1">Votre Gain Net</p>
             <p className="text-2xl font-black">{formatFCFA(order.deliveryFee)}</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <Banknote className="h-6 w-6 text-emerald-500 mb-2" />
            <p className="text-[10px] font-black uppercase text-slate-400">À collecter (COD)</p>
            <p className="text-lg font-black text-slate-900">{formatFCFA(order.amountDue)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <ShieldCheck className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-[10px] font-black uppercase text-slate-400">Caution exigée</p>
            <p className="text-lg font-black text-slate-900">{formatFCFA(requiredDeposit)}</p>
          </div>
        </div>

        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
           <div className="flex items-start gap-4">
             <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
               <MapPin className="h-6 w-6" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Destination</p>
               <p className="font-bold text-slate-900 leading-tight">
                 {order.commune} — {order.deliveryAddress?.split(',')[0] || "Quartier masqué"}
               </p>
               <p className="text-[10px] font-medium text-slate-400 mt-1">Précisions après acceptation</p>
             </div>
           </div>
           
           <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
             <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
             <div className="text-xs font-bold text-amber-900 leading-relaxed">
               L&apos;identité complète et le contact du client sont masqués pour protéger le vendeur d&apos;origine. Acceptez la course pour lever l&apos;anonymat.
             </div>
           </div>
        </section>

        <section className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 fill-emerald-400" />
            Engagement Financier
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed font-medium">
            {requiredDeposit > 0 ? (
              <p>
                La caution exigée de <strong className="text-white">{formatFCFA(requiredDeposit)}</strong> sera temporairement gelée sur votre SocialWallet. Elle vous sera restituée dès la validation de la livraison ou le retour conforme du colis.
              </p>
            ) : (
              <p>
                Aucune caution n&apos;est exigée pour ce colis. Votre SocialWallet ne sera pas débité lors de l&apos;acceptation.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* ── AFFICHAGE CONDITIONNEL DU FOOTER ── */}
      <footer className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10">
        {hasEnoughFunds ? (
          <form action={async () => { 
            "use server"; 
            const result = await claimOpportunityAction(order.id); 
            
            if ("success" in result) {
              redirect("/pwa");
            } else {
              console.error(result.error);
            }
          }}>
            <button className="w-full py-5 rounded-3xl bg-slate-900 text-white font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/30 active:scale-95 transition-all">
              <Zap className="h-6 w-6 text-emerald-400 fill-emerald-400" />
              Saisir cette opportunité
            </button>
          </form>
        ) : (
          <DepositWarningCard 
            currentBalance={currentBalance} 
            requiredDeposit={requiredDeposit} 
          />
        )}
      </footer>
    </div>
  );
}
