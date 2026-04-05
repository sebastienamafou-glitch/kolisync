import Link from "next/link";
import { AlertTriangle, Wallet, ArrowRight } from "lucide-react";

interface DepositWarningCardProps {
  currentBalance: number;
  requiredDeposit: number;
}

export function DepositWarningCard({ currentBalance, requiredDeposit }: DepositWarningCardProps) {
  const missingAmount = requiredDeposit - currentBalance;
  
  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

  return (
    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2rem] flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div className="bg-red-500/20 p-3 rounded-2xl text-red-400 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1.5">
            Solde Insuffisant
          </h4>
          <p className="text-sm font-medium text-slate-300 leading-relaxed">
            Il vous manque <strong className="text-white">{formatFCFA(missingAmount)}</strong> pour couvrir la caution de cette opportunité.
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

      {/* Remplacer le href par l'URL exacte de ta page de rechargement */}
      <Link 
        href="/pwa/wallet" 
        className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        Recharger mon compte <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
