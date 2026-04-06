"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyDeliveryAction } from "@/app/actions/delivery";
import { useOfflineDelivery } from "@/hooks/useOfflineDelivery";
import { CheckCircle2, ShieldAlert, Loader2, Lock, WifiOff } from "lucide-react";

interface DeliveryValidationFormProps {
  orderId: string;
  amountDue: number;
}

export default function DeliveryValidationForm({ orderId, amountDue }: DeliveryValidationFormProps) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Nouveaux états de succès pour l'UX Optimiste
  const [success, setSuccess] = useState(false);
  const [isOfflineSuccess, setIsOfflineSuccess] = useState(false);
  
  const router = useRouter();

  // 🚨 KOLISYNC OFFLINE ENGINE : Branchement de notre hook PWA
  const { executeDelivery, isProcessing, isOfflineMode } = useOfflineDelivery(verifyDeliveryAction);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (pin.length < 4) {
      setErrorMsg("Le code PIN doit contenir au moins 4 caractères.");
      return;
    }

    // On délègue l'exécution au hook (qui gère le routage Online/Offline automatiquement)
    const result = await executeDelivery(orderId, pin);
    
    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.success) {
      setSuccess(true);
      // Si la validation a été faite hors-ligne, on adapte l'UI
      if (result.isOffline) {
        setIsOfflineSuccess(true);
      }
      // Redirection après 2.5 secondes pour laisser le temps de lire le message
      setTimeout(() => router.push("/pwa"), 2500);
    }
  };

  // ── ÉCRAN DE SUCCÈS (Adapté selon l'état du réseau) ──
  if (success) {
    return (
      <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 ${
        isOfflineSuccess ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
      }`}>
        {isOfflineSuccess ? (
          <WifiOff className="h-12 w-12 text-amber-500 mb-3" />
        ) : (
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
        )}
        
        <h3 className={`text-lg font-black ${isOfflineSuccess ? "text-amber-900" : "text-emerald-900"}`}>
          {isOfflineSuccess ? "Validé en local !" : "Livraison Validée !"}
        </h3>
        <p className={`text-sm font-medium mt-1 leading-relaxed ${isOfflineSuccess ? "text-amber-700" : "text-emerald-700"}`}>
          {isOfflineSuccess 
            ? "Réseau faible. La livraison est sauvegardée et sera synchronisée dès le retour de la connexion." 
            : "La caution a été débloquée et votre prime sociale est créditée."}
        </p>
      </div>
    );
  }

  // ── FORMULAIRE PRINCIPAL ──
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
      
      {/* 🚨 Bannière d'alerte réseau */}
      {isOfflineMode && (
        <div className="absolute top-0 left-0 w-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest text-center py-1 flex items-center justify-center gap-1.5 animate-in slide-in-from-top-2">
          <WifiOff className="h-3 w-3" /> Mode Hors-ligne actif
        </div>
      )}

      <div className={`flex items-start gap-3 ${isOfflineMode ? "pt-4" : ""}`}>
        <div className="p-2 bg-blue-50 rounded-xl">
          <Lock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-none">Code de Sécurité</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Demandez le code PIN au client pour confirmer la remise du colis et encaisser les 
            <span className="font-bold text-slate-900"> {new Intl.NumberFormat("fr-FR").format(amountDue)} FCFA</span>.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="Ex: 1234"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          disabled={isProcessing}
          className="w-full text-center text-2xl tracking-[0.5em] font-black p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isProcessing || pin.length < 4}
          className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 ${
            isOfflineMode 
              ? "bg-amber-500 hover:bg-amber-400 text-slate-900" 
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isOfflineMode ? (
            <>Valider hors-ligne <WifiOff className="h-4 w-4 opacity-50" /></>
          ) : (
            "Valider la livraison"
          )}
        </button>
      </form>
    </div>
  );
}
