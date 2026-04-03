"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Send, Loader2, AlertCircle, Phone, MapPin, Banknote } from "lucide-react";
import { PackageStatus } from "@prisma/client";
import { dispatchPackagesAction } from "@/app/actions/packages";

interface Driver {
  id: string;
  name: string;
}

interface OrderProps {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  amountDue: number;
  packageStatus: PackageStatus;
  createdAt: Date;
  driver: { name: string; phone: string } | null;
}

interface BulkDispatchProps {
  orders: OrderProps[];
  drivers: Driver[];
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Assigner ({count})
    </button>
  );
}

export function BulkDispatchTable({ orders, drivers }: BulkDispatchProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [driverId, setDriverId] = useState("");
  const [state, formAction] = useActionState(dispatchPackagesAction, null);

  // Vider la sélection en cas de succès
  useEffect(() => {
    if (state?.success) {
      setSelectedIds(new Set());
      setDriverId("");
    }
  }, [state]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    const pendingOrders = orders.filter((o) => o.packageStatus === "PENDING");
    if (selectedIds.size === pendingOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingOrders.map((o) => o.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre d'action de Dispatching */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={selectedIds.size > 0 && selectedIds.size === orders.filter((o) => o.packageStatus === "PENDING").length}
            onChange={toggleAll}
            className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          Tout sélectionner ({selectedIds.size})
        </div>

        <form action={formAction} className="flex w-full sm:w-auto items-center gap-3">
          <input type="hidden" name="packageIds" value={JSON.stringify(Array.from(selectedIds))} />
          
          <select
            name="driverId"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            required
            className="block w-full sm:w-48 rounded-xl border-0 py-2 pl-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-slate-900"
          >
            <option value="" disabled>Choisir un livreur...</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>

          <SubmitButton count={selectedIds.size} />
        </form>
      </div>

      {state?.error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 ring-1 ring-red-200">
          {state.error}
        </div>
      )}

      {/* Rendu de la liste (mixte Mobile/Desktop) */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="divide-y divide-slate-100">
          {orders.map((order) => {
            const isPending = order.packageStatus === "PENDING";
            return (
              <div key={order.id} className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50/60 ${selectedIds.has(order.id) ? "bg-amber-50/50" : ""}`}>
                
                {/* Checkbox (uniquement si PENDING) */}
                <div className="pt-1">
                  {isPending ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                  ) : (
                    <div className="h-5 w-5" /> // Espaceur
                  )}
                </div>

                {/* Détails du colis */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">ID: {order.id.slice(-6).toUpperCase()}</p>
                    </div>
                    {isPending ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">En attente</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Assigné</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" />{order.customerPhone}</span>
                    <span className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-slate-400" /><strong>{formatFCFA(order.amountDue)}</strong></span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  )}
                  {order.driver && (
                    <div className="text-xs font-semibold text-amber-600">
                      Livreur : {order.driver.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
