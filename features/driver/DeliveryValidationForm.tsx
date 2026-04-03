"use client";

import { useState, useTransition } from "react";
import { verifyDeliveryAction } from "@/app/actions/delivery";
import { CheckCircle2, ShieldAlert, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeliveryValidationFormProps {
  orderId: string;
  amountDue: number;
}

export default function DeliveryValidationForm({ orderId, amountDue }: DeliveryValidationFormProps) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setErrorMsg(null);
    
    if (pin.length < 4) {
      setErrorMsg("Le code PIN doit contenir au moins 4 caractères.");
      return;
    }

    startTransition(async () => {
      const result = await verifyDeliveryAction(orderId, pin);
      
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccess(true);
        // Redirection vers le dashboard après 2 secondes pour laisser le temps de lire le message
        setTimeout(() => router.push("/pwa"), 2000);
      }
    });
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
        <h3 className="text-lg font-black text-emerald-900">Livraison Validée !</h3>
        <p className="text-sm text-emerald-700 font-medium mt-1">
          La caution a été débloquée et votre prime sociale est créditée.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
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
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // N'accepte que les chiffres
          disabled={isPending}
          className="w-full text-center text-2xl tracking-[0.5em] font-black p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isPending || pin.length < 4}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Valider la livraison"
          )}
        </button>
      </form>
    </div>
  );
}
