import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Banknote
} from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { initializeDepositAction } from "@/app/actions/paystack";

// ── ACTION SERVER : Initialisation du paiement Paystack ──
async function paystackCheckoutAction(formData: FormData) {
  "use server";
  const result = await initializeDepositAction(formData);

  if (result?.error) {
    redirect(`/pwa/wallet?error=${encodeURIComponent(result.error)}`);
  } else if (result?.url) {
    redirect(result.url);
  }
}

export default async function PwaWalletPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  const { error } = await searchParams;
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") redirect("/");

  // 1. Récupération du Wallet et de l'Historique
  const wallet = await prismaAdmin.socialWallet.findUnique({
    where: { userId: session.userId },
    include: {
      transactions: {
        orderBy: { id: "desc" },
        take: 10,
        include: { order: { select: { id: true, commune: true } } }
      }
    }
  });

  if (!wallet) redirect("/pwa");

  // 2. Calcul de la Smart Cash Limit (Liquide détenu physiquement)
  const driverConfig = await prismaAdmin.user.findUnique({
    where: { id: session.userId },
    select: { maxCashLimit: true }
  });

  const cashResult = await prismaAdmin.order.aggregate({
    where: { driverId: session.userId, cashStatus: "HELD_BY_DRIVER" },
    _sum: { amountDue: true },
  });

  const currentCash = cashResult._sum.amountDue || 0;
  const maxCashLimit = driverConfig?.maxCashLimit || 50000;
  const cashPercentage = Math.min(Math.round((currentCash / maxCashLimit) * 100), 100);
  const isCashDanger = cashPercentage >= 90;

  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR").format(Math.abs(amount)) + " FCFA";

  const getTransactionDetails = (type: string, amount: number) => {
    const isPositive = amount > 0;
    
    if (isPositive) {
      if (type === "ADJUSTMENT") return { label: "Caution restituée / Dépôt", color: "emerald" };
      if (type === "CONTRIBUTION") return { label: "Prime exceptionnelle", color: "emerald" };
      return { label: "Crédit entrant", color: "emerald" };
    } else {
      if (type === "CONTRIBUTION") return { label: "Épargne Forcée (Prélèvement)", color: "amber" };
      if (type === "ADJUSTMENT") return { label: "Caution gelée / Ajustement", color: "amber" };
      if (type === "PAYOUT") return { label: "Paiement CNPS / Assurance", color: "blue" };
      return { label: "Débit", color: "amber" };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* ── HEADER ── */}
      <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/pwa" className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Portefeuille</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Wallet className="h-5 w-5" />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        
        {/* ── CARTE DU SOLDE NUMÉRIQUE ── */}
        <section className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Caution & Épargne (Solde Digital)
            </p>
            <p className="text-4xl font-black tracking-tight mb-8">
              {formatFCFA(wallet.balance)}
            </p>

            <div className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form action={paystackCheckoutAction} className="flex gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                <input 
                  type="number" 
                  name="amount" 
                  min="100" 
                  required 
                  placeholder="Montant (ex: 2000)" 
                  className="flex-1 w-full bg-transparent text-white px-3 font-bold placeholder:text-slate-500 outline-none focus:ring-0"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 shrink-0">
                  <ArrowDownToLine className="h-4 w-4" />
                  Dépôt
                </button>
              </form>

              <Link href="/pwa/wallet/withdraw" className="w-full bg-slate-800 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700 hover:bg-slate-700">
                Demander un retrait
              </Link>
            </div>
          </div>
        </section>

        {/* ── JAUGE SMART CASH LIMIT (CASH PHYSIQUE) ── */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-slate-400" />
              Cash en poche (COD)
            </h2>
            <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-full ${isCashDanger ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}`}>
              {cashPercentage}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-900">{formatFCFA(currentCash)}</span>
              <span className="text-slate-400">{formatFCFA(maxCashLimit)} max</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isCashDanger ? "bg-red-500" : cashPercentage > 60 ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{ width: `${cashPercentage}%` }}
              />
            </div>
            {isCashDanger && (
              <p className="text-[11px] font-bold text-red-500 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Plafond de sécurité atteint. Allez reverser votre cash.
              </p>
            )}
          </div>
        </section>

        {/* ── HISTORIQUE DES TRANSACTIONS ── */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[50vh]">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            Derniers mouvements
          </h2>

          {wallet.transactions.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <History className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-500">Aucune transaction.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const details = getTransactionDetails(tx.type, tx.amount);
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                        details.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                        details.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {isPositive ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {details.label}
                        </p>
                        {tx.order && (
                          <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" /> 
                            Colis #{tx.order.id.slice(-4).toUpperCase()} ({tx.order.commune})
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm font-black ${
                      details.color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {isPositive ? '+' : '-'}{formatFCFA(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
