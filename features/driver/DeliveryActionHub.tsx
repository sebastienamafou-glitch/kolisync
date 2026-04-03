"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { verifyDeliveryAction, reportIncidentAction } from "@/app/actions/delivery";

interface DeliveryActionHubProps {
  orderId: string;
  amountDue: number;
}

export default function DeliveryActionHub({ orderId, amountDue }: DeliveryActionHubProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // États de l'interface
  const [pinCode, setPinCode] = useState("");
  const [reportMode, setReportMode] = useState(false);

  // Validation par PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) return;
    
    setErrorMsg(null);
    startTransition(async () => {
      const result = await verifyDeliveryAction(orderId, pinCode);
      if (result?.error) setErrorMsg(result.error);
    });
  };

  // Signalement de Litige
  const handleReport = async (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      // Simulation GPS pour l'exemple
      formData.append("latitude", "5.3599");
      formData.append("longitude", "-4.0083");
      
      const result = await reportIncidentAction(formData);
      if (result?.error) setErrorMsg(result.error);
      else setReportMode(false);
    });
  };

  if (reportMode) {
    return (
      <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-orange-600">
          <ShieldAlert className="h-6 w-6" />
          <h3 className="font-black">Signaler un litige</h3>
        </div>
        
        <form action={handleReport} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          
          <select name="reason" required className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:border-orange-400">
            <option value="">Sélectionnez un motif...</option>
            <option value="CLIENT_ABSENT">Client injoignable / absent</option>
            <option value="REFUSAL_TO_PAY">Refus de payer le montant exact</option>
            <option value="CLIENT_LIAR">Le client prétend ne rien avoir commandé</option>
          </select>

          <textarea 
            name="comment" 
            placeholder="Détaillez la situation (Optionnel)"
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-medium text-slate-700 outline-none focus:border-orange-400"
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setReportMode(false)}
              className="w-1/3 rounded-2xl bg-slate-100 py-3 font-bold text-slate-500"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex w-2/3 items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 font-black text-white active:scale-95"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer le rapport"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone de Validation Principale */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Clôturer la course
          </h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">
            Sécurisé
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 ring-1 ring-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
              Code PIN du client
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Ex: 1234"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || pinCode.length < 4}
            className="flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 font-black text-white shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : `Valider l'encaissement`}
          </button>
        </form>
      </div>

      {/* Zone d'assistance (Litige) */}
      <button 
        onClick={() => setReportMode(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-500 transition-colors hover:bg-slate-50 active:scale-95"
      >
        <AlertTriangle className="h-5 w-5" />
        Un problème sur place ?
      </button>
    </div>
  );
}
