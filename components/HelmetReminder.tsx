"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function HelmetReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // On génère une chaîne pour la date du jour (ex: "2026-04-03")
    const today = new Date().toLocaleDateString("fr-FR");
    const lastAcknowledgment = localStorage.getItem("kolisync_helmet_date");

    // Si la date enregistrée n'est pas celle d'aujourd'hui, on affiche le rappel
    if (lastAcknowledgment !== today) {
      setShowReminder(true);
    }
  }, []);

  // Évite les erreurs d'hydratation Next.js
  if (!isMounted || !showReminder) return null;

  const handleAcknowledge = () => {
    const today = new Date().toLocaleDateString("fr-FR");
    localStorage.setItem("kolisync_helmet_date", today);
    setShowReminder(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md text-slate-50 font-sans selection:bg-amber-500/20 px-6 py-12 justify-center relative overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.15) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm mx-auto text-center space-y-8">
        
        <div className="h-28 w-28 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="h-12 w-12 text-amber-500 animate-pulse" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Sécurité avant tout</h1>
          <p className="text-base text-slate-300 leading-relaxed font-medium">
            Votre vie vaut plus qu&apos;une course. Avant de démarrer votre tournée, assurez-vous d&apos;avoir bien attaché votre casque.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-left">
          <ul className="space-y-3 text-sm font-semibold text-amber-200/80">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              Le casque est obligatoire.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              Respectez les feux tricolores.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              Ne manipulez pas l&apos;application en roulant.
            </li>
          </ul>
        </div>

        <button 
          onClick={handleAcknowledge}
          className="w-full py-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
        >
          <CheckCircle2 className="h-5 w-5" /> Je porte mon casque
        </button>

      </div>
    </div>
  );
}
