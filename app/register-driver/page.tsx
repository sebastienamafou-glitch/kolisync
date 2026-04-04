"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Bike, Loader2 } from "lucide-react";
import { registerDriverAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70 transition-all active:scale-[0.98] uppercase tracking-widest"
    >
      {pending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Création...</> : "Devenir Livreur"}
    </button>
  );
}

export default function RegisterDriverPage() {
  const [state, formAction] = useActionState(registerDriverAction, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 selection:bg-blue-500/30">
      <div className="w-full max-w-md rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-800">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Bike className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Rejoins KoliSync</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Deviens livreur indépendant et accède à la bourse globale de colis.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nom complet</label>
            <input type="text" name="name" required className="block w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Moussa Diaby" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Numéro de téléphone</label>
            <input type="tel" name="phone" required maxLength={10} className="block w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 0500000000" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Zone de préférence</label>
            <select name="preferredCommune" required className="block w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none">
              <option value="">Choisir une commune...</option>
              <option value="Cocody">Cocody</option>
              <option value="Yopougon">Yopougon</option>
              <option value="Marcory">Marcory</option>
              <option value="Plateau">Plateau</option>
              <option value="Treichville">Treichville</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Code PIN (4 chiffres)</label>
            <input type="password" name="pinCode" required minLength={4} maxLength={4} pattern="[0-9]{4}" className="block w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white font-black tracking-[0.5em] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="••••" />
            <p className="mt-2 text-[10px] text-slate-500">Ce code te servira pour te connecter et valider les livraisons.</p>
          </div>

          {/* 🚨 CHECKBOX LÉGALE LIVREUR */}
          <div className="flex items-start gap-3 mt-6">
            <input
              type="checkbox"
              name="acceptTerms"
              id="acceptTerms"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
            />
            <label htmlFor="acceptTerms" className="text-[11px] text-slate-400 leading-relaxed">
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link href="/cgu" className="text-blue-400 hover:underline">Conditions Générales d&apos;Utilisation</Link>
              {" "}et la{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">Politique de Confidentialité</Link>.
            </label>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">Déjà inscrit ?</span>{" "}
          <Link href="/" className="font-bold text-white hover:text-blue-400 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
