"use client";

import { useState, useTransition } from "react";
import { MapPin, Banknote, Package, Loader2, AlertCircle } from "lucide-react";

import { claimPublicOrderAction } from "@/app/actions/delivery";

interface OrderRadarProps {
  order: {
    id: string;
    customerName: string;
    commune: string | null;
    deliveryAddress: string | null;
    amountDue: number;
    deliveryFee: number;
  };
}

export default function OrderRadarCard({ order }: OrderRadarProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = () => {
    setErrorMsg(null);
    startTransition(async () => {
      // 🚨 CORRECTION : Appel de la fonction avec le bon paramètre unique
      const result = await claimPublicOrderAction(order.id);
      
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{order.commune || "Zone non précisée"}</h3>
            <p className="text-sm text-gray-500">{order.customerName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Gain</p>
          <p className="font-bold text-green-600">{order.deliveryFee} FCFA</p>
        </div>
      </div>

      <div className="mb-4 flex items-center text-sm text-gray-600">
        <MapPin className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{order.deliveryAddress || "Adresse à confirmer"}</span>
      </div>

      <div className="mb-4 flex items-center text-sm text-gray-600">
        <Banknote className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
        <span>À encaisser : <strong className="text-gray-900">{order.amountDue} FCFA</strong></span>
      </div>

      {errorMsg && (
        <div className="mb-3 flex items-center rounded-md bg-red-50 p-2 text-sm text-red-600">
          <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Acceptation...
          </>
        ) : (
          "Accepter la course"
        )}
      </button>
    </div>
  );
}
