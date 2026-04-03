"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { reconcileCashAction } from "@/app/actions/reconciliation";

function SubmitButton({ amountFormatted }: { amountFormatted: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-amber-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Validation...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-5 w-5" />
          Encaisser {amountFormatted}
        </>
      )}
    </button>
  );
}

// 🚨 La seule modification est ici : ajout de "default"
export default function ReconcileForm({
  driverId,
  amountFormatted,
}: {
  driverId: string;
  amountFormatted: string;
}) {
  const [state, formAction] = useActionState(reconcileCashAction, null);

  // Alerte native si une erreur survient (KISS)
  useEffect(() => {
    if (state?.error) {
      alert(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 sm:mt-0 sm:shrink-0">
      <input type="hidden" name="driverId" value={driverId} />
      <SubmitButton amountFormatted={amountFormatted} />
    </form>
  );
}
