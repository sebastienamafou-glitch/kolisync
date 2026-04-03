import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Banknote,
  AlertTriangle,
  User,
  Package,
  ArrowRight,
  Store
} from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";

import DeliveryValidationForm from "@/features/driver/DeliveryValidationForm";
import IncidentReportClient from "@/features/driver/IncidentReportClient"; 
import { GpsStatusButton } from "@/components/GpsStatusButton";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") redirect("/");

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  const order = await prismaAdmin.order.findUnique({
    where: { id: orderId },
    include: {
      tenant: {
        include: {
          users: {
            where: { role: "OWNER" },
            select: { phone: true }
          }
        }
      }
    }
  });

  if (!order || order.driverId !== session.userId) redirect("/pwa");

  // ── Extraction des informations marchandes ──
  const shopName = order.tenant.name;
  const shopPhone = order.tenant.users[0]?.phone || "";
  const pickupAddress = order.pickupAddress || "Adresse non précisée";
  
  // ── Génération intelligente de l'itinéraire GPS ──
  // On donne la priorité aux coordonnées exactes (lat/lng), sinon on fallback sur l'adresse textuelle
  const mapQuery = order.pickupLat && order.pickupLng 
    ? `${order.pickupLat},${order.pickupLng}`
    : encodeURIComponent(`${pickupAddress}, Côte d'Ivoire`);
    
  const mapUrl = `https://maps.google.com/?q=${mapQuery}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* ── HEADER FIXE ── */}
      <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/pwa" className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors">
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Détails de la course</h1>
          <p className="text-xs font-bold text-emerald-600 uppercase">
            ID: #{order.id.slice(-6).toUpperCase()}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        
        {/* ── INFOS CLIENT (Destinataire Final) ── */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="h-32 w-32" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Client final
              </p>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                {order.customerName}
              </h1>
            </div>
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mt-1">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                {order.commune}
              </p>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {order.deliveryAddress || "Aucune précision d'adresse fournie."}
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-900 text-white font-black active:scale-95 transition-transform relative z-10 shadow-lg shadow-slate-900/20"
          >
            <Phone className="h-5 w-5" />
            Appeler le {order.customerPhone}
          </a>
        </section>

        {/* ── MONTANT COD ── */}
        <div className="overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <Banknote className="h-6 w-6" />
            <span className="text-xs font-black uppercase tracking-widest">Montant à encaisser</span>
          </div>
          <p className="text-4xl font-black tracking-tight">{formatFCFA(order.amountDue)}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">Espèces uniquement. Vérifiez les billets.</p>
        </div>

        {/* ── ACTIONS & STATUTS ── */}
        <section className="space-y-4">
          
          {order.packageStatus === "DELIVERED_VERIFIED" || order.packageStatus === "DELIVERED_UNSECURED" ? (
            <div className="mt-8 rounded-3xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
              <h2 className="text-xl font-black text-emerald-700">Livraison Validée</h2>
              <p className="text-sm font-medium text-emerald-600">Le cash est sous votre responsabilité.</p>
            </div>
          ) : order.packageStatus === "CONFLICT" ? (
            <div className="mt-8 rounded-3xl bg-orange-50 p-6 text-center ring-1 ring-orange-200">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-black text-orange-700">Litige Signalé</h2>
              <p className="mt-2 text-sm font-medium text-orange-600">
                En attente d&rsquo;arbitrage. Aucune sanction ne s&rsquo;applique pour le moment.
              </p>
            </div>
          ) : order.packageStatus === "DISPATCHED" ? (
            
            <div className="space-y-4 mt-8">
              {/* ── ÉTAPE 1 : RÉCUPÉRATION DU COLIS (AVEC BOUTON GPS) ── */}
              <div className="rounded-[2.5rem] bg-blue-50 p-6 ring-1 ring-blue-200 space-y-6">
                
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-black">1</div>
                  <h2 className="text-lg font-black text-blue-900 tracking-tight">Point de retrait</h2>
                </div>

                {/* ENCART COMMERÇANT */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                      <Store className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boutique B2B</p>
                      <p className="font-black text-slate-900 text-lg leading-tight">{shopName}</p>
                      <p className="text-sm font-medium text-slate-500 mt-1 leading-snug">{pickupAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <a 
                      href={`tel:${shopPhone}`} 
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm transition-colors active:scale-95"
                    >
                      <Phone className="h-4 w-4" /> Appeler
                    </a>
                    <a 
                      href={mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20 transition-colors active:scale-95"
                    >
                      <MapPin className="h-4 w-4" /> Itinéraire
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <GpsStatusButton 
                    orderId={order.id} 
                    targetStatus="IN_TRANSIT" 
                    label="J'ai récupéré le colis" 
                    colorClass="bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 opacity-50 mt-4">
                <div className="h-8 w-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 font-black">2</div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validation (Bloqué)</span>
              </div>
            </div>

          ) : order.packageStatus === "IN_TRANSIT" ? (
            
            <div className="mt-8">
              {/* ── ÉTAPE 2 : LIVRAISON & VALIDATION ── */}
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-black shadow-lg">2</div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Clôture de la course
                </h2>
              </div>
              
              <DeliveryValidationForm orderId={order.id} amountDue={order.amountDue} />

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Un problème sur place ?
                </h3>
                <IncidentReportClient orderId={order.id} />
              </div>
            </div>
          ) : null}
        </section>

      </main>
    </div>
  );
}
