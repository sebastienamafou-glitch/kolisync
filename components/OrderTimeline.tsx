import { PackageStatus } from "@prisma/client";
import { 
  CheckCircle2, 
  MapPin, 
  Package, 
  Truck, 
  AlertTriangle, 
  Clock,
  ExternalLink
} from "lucide-react";

interface TimelineEvent {
  id: string;
  status: PackageStatus;
  createdAt: Date;
  latitude: number | null;
  longitude: number | null;
  reason: string | null;
  author: { name: string };
}

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  // Traduction et icônes pour chaque statut
  const getStatusConfig = (status: PackageStatus) => {
    switch (status) {
      case "PENDING": return { label: "En attente d'un livreur", icon: Clock, color: "text-slate-500", bg: "bg-slate-100" };
      case "DISPATCHED": return { label: "Assigné au livreur", icon: Package, color: "text-blue-600", bg: "bg-blue-100" };
      case "IN_TRANSIT": return { label: "En cours de livraison", icon: Truck, color: "text-amber-600", bg: "bg-amber-100" };
      case "DELIVERED_VERIFIED": return { label: "Livré (Code PIN Validé)", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" };
      case "FAILED_RETURNED": return { label: "Échec de livraison", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" };
      default: return { label: status, icon: Package, color: "text-slate-500", bg: "bg-slate-100" };
    }
  };

  return (
    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-4">
      {events.map((event, index) => {
        const config = getStatusConfig(event.status);
        const isLatest = index === 0; // On suppose que le tableau est trié par date décroissante

        return (
          <div key={event.id} className="relative pl-8">
            {/* Point de la timeline */}
            <div className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${config.bg} ${config.color}`}>
              <config.icon className="h-4 w-4" />
            </div>

            <div className={`flex flex-col gap-1 ${isLatest ? 'opacity-100' : 'opacity-60 grayscale'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-black ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>
                  {config.label}
                </p>
                <time className="text-xs font-bold text-slate-400">
                  {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(event.createdAt)}
                </time>
              </div>

              <p className="text-xs font-medium text-slate-500">
                Actionnée par : <span className="font-bold text-slate-700">{event.author.name}</span>
              </p>

              {event.reason && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-600 border border-slate-100">
                  Motif : {event.reason}
                </div>
              )}

              {/* ── LE BOUTON GPS ── */}
              {event.latitude && event.longitude && (
                <div className="mt-3">
                  <a 
                    href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <MapPin className="h-3 w-3" />
                    Voir la position exacte sur la carte
                    <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
