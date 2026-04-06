"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle, AlertTriangle, ShieldAlert, WifiOff } from "lucide-react";
import { verifyDeliveryAction, reportIncidentAction } from "@/app/actions/delivery";
// 🚨 Import de notre moteur hors-ligne
import { useOfflineDelivery } from "@/hooks/useOfflineDelivery";

interface DeliveryActionHubProps {
  orderId: string;
  amountDue: number;
}

export default function DeliveryActionHub({ orderId, amountDue }: DeliveryActionHubProps) {
  const [isPendingReport, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [pinCode, setPinCode] = useState("");
  const [reportMode, setReportMode] = useState(false);

  // États de succès PWA
  const [success, setSuccess] = useState(false);
  const [isOfflineSuccess, setIsOfflineSuccess] = useState(false);

  // 🚨 KOLISYNC OFFLINE ENGINE
  const { executeDelivery, isProcessing, isOfflineMode } = useOfflineDelivery(verifyDeliveryAction);

  // Validation par PIN (Désormais gérée par le Hook PWA)
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) return;
    
    setErrorMsg(null);
    const result = await executeDelivery(orderId, pinCode);
    
    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.success) {
      setSuccess(true);
      if (result.isOffline) setIsOfflineSuccess(true);
      // Redirection après succès
      setTimeout(() => { window.location.href = "/pwa"; }, 2000);
    }
  };

  // Signalement de Litige
  const handleReport = async (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      formData.append("latitude", "5.3599");
      formData.append("longitude", "-4.0083");
      
      // 🚨 CORRECTION TS : On passe 'null' en premier paramètre (prevState attendu par Next)
      const result = await reportIncidentAction(null, formData);
      
      // 🚨 CORRECTION TS : Vérification stricte du type d'union
      if (result && "error" in result && result.error) {
        setErrorMsg(result.error);
      } else {
        setReportMode(false);
      }
    });
  };

  // ── ÉCRAN DE SUCCÈS (Offline / Online) ──
  if (success) {
    return (
      <div className={`rounded-3xl border-2 p-6 shadow-sm text-center animate-in zoom-in duration-300 ${
        isOfflineSuccess ? "bg-amber-50 border-amber-100 text-amber-900" : "bg-emerald-50 border-emerald-100 text-emerald-900"
      }`}>
        <div className="flex justify-center mb-3">
          {isOfflineSuccess ? <WifiOff className="h-12 w-12 text-amber-500" /> : <CheckCircle className="h-12 w-12 text-emerald-500" />}
        </div>
        <h3 className="font-black text-lg">{isOfflineSuccess ? "Validé en local !" : "Livraison Validée !"}</h3>
        <p className="text-sm font-medium mt-2 opacity-80">
          {isOfflineSuccess ? "Sauvegardé. Synchro au retour du réseau." : "Caution débloquée avec succès."}
        </p>
      </div>
    );
  }

  // ── ÉCRAN DE LITIGE ──
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
          <textarea name="comment" placeholder="Détaillez la situation (Optionnel)" className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-medium text-slate-700 outline-none focus:border-orange-400" rows={3} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setReportMode(false)} className="w-1/3 rounded-2xl bg-slate-100 py-3 font-bold text-slate-500">Annuler</button>
            <button type="submit" disabled={isPendingReport} className="flex w-2/3 items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 font-black text-white active:scale-95 disabled:opacity-50">
              {isPendingReport ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── ÉCRAN DE VALIDATION PRINCIPAL ──
  return (
    <div className="space-y-4 relative">
      {/* 🚨 Bannière d'alerte réseau */}
      {isOfflineMode && (
        <div className="absolute -top-12 left-0 w-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-xl flex items-center justify-center gap-1.5 animate-in slide-in-from-top-2">
          <WifiOff className="h-3 w-3" /> Mode Hors-ligne actif
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" /> Clôturer la course
          </h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">Sécurisé</span>
        </div>

        {errorMsg && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 ring-1 ring-red-100">{errorMsg}</div>}

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Code PIN du client</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 1234" disabled={isProcessing} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition-all disabled:opacity-50" />
          </div>

          <button type="submit" disabled={isProcessing || pinCode.length < 4} className={`flex w-full items-center justify-center rounded-2xl py-4 font-black shadow-lg active:scale-95 disabled:opacity-50 transition-all ${isOfflineMode ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20" : "bg-slate-900 text-white shadow-slate-900/20"}`}>
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : isOfflineMode ? "Valider hors-ligne" : "Valider l'encaissement"}
          </button>
        </form>
      </div>

      <button onClick={() => setReportMode(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-500 transition-colors hover:bg-slate-50 active:scale-95">
        <AlertTriangle className="h-5 w-5" /> Un problème sur place ?
      </button>
    </div>
  );
}
