"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight, Phone, Banknote, ShieldAlert, Loader2 } from "lucide-react";
import { requestWithdrawalAction } from "@/app/actions/wallet";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          Confirmer le retrait <ArrowUpRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function WithdrawPage() {
  const [state, formAction] = useActionState(requestWithdrawalAction, null);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* ── HEADER ── */}
      <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/pwa/wallet" className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors">
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Retrait d'argent</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 mt-2">
          
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
            <ArrowUpRight className="h-8 w-8" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Transférer vers <br />Mobile Money
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed mb-8">
            L'argent sera déduit de votre SocialWallet et envoyé sur votre numéro sous 24h ouvrées.
          </p>

          <form action={formAction} className="space-y-5">
            
            {state?.error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-200 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                {state.error}
              </div>
            )}

            {/* Champ Montant */}
            <div>
              <label htmlFor="amount" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Montant à retirer
              </label>
              <div className="relative">
                <Banknote className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="1000"
                  placeholder="Ex: 5000"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold text-lg"
                />
              </div>
            </div>

            {/* Champ Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Numéro de réception
              </label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Ex: 01 02 03 04 05"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold"
                />
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Compatible Wave, Orange, MTN, Moov
              </p>
            </div>

            <SubmitButton />
          </form>

        </div>
      </main>
    </div>
  );
}
