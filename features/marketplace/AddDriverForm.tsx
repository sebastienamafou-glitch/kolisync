"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus, Loader2, User, Phone, Lock } from "lucide-react";
import { addDriverAction } from "@/app/actions/team";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Création en cours...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Ajouter ce livreur
        </>
      )}
    </button>
  );
}

export function AddDriverForm() {
  const [state, formAction] = useActionState(addDriverAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Nouveau Livreur</h3>
        <p className="text-sm text-slate-500">Générez un accès pour un nouveau membre de la flotte.</p>
      </div>

      {state?.error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-200">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-600 ring-1 ring-emerald-200">
          {state.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Nom complet
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Moussa Diaby"
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Téléphone (Identifiant)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="Ex: 0500000000"
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pin" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
            Code PIN (Mot de passe)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="pin"
              name="pin"
              required
              maxLength={6}
              placeholder="Ex: 1234"
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
