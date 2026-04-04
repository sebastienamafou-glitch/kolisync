"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createPackageSchema } from "@/lib/dtos";
import { getSession } from "@/lib/session";
import { sendDeliveryPinSMS } from "@/lib/sms";
// 🚨 NOUVEL IMPORT : On utilise le Trust Engine centralisé
import { checkCustomerRiskAction } from "@/app/actions/risk";

export async function createPackageAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  
  if (!session || session.role !== "OWNER") {
    return { error: "Action non autorisée." };
  }

  if (!formData || typeof formData.get !== 'function') {
    return { error: "Erreur technique : les données du formulaire sont invalides." };
  }

  try {
    const rawData = Object.fromEntries(formData.entries());
    const dataToParse = {
      ...rawData,
      isPublic: formData.get("isPublic") === "on",
    };
    
    const parsed = createPackageSchema.safeParse(dataToParse);

    if (!parsed.success) {
      const errorMessage = 
        parsed.error?.issues?.[0]?.message || 
        "Veuillez vérifier les données saisies (ex: les prix doivent être des nombres).";

      return { error: errorMessage };
    }

    // 🚨 VÉRIFICATION DU QUOTA D'ABONNEMENT
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { 
        isPro: true,
        _count: { select: { orders: true } } 
      }
    });

    if (!tenant?.isPro && (tenant?._count.orders || 0) >= 30) {
      return { 
        error: "QUOTA_EXCEEDED", 
        message: "Quota gratuit atteint (30/30). Veuillez passer à l'abonnement PRO (10 000 FCFA) pour continuer." 
      };
    }

    const { 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      commune, 
      amountDue, 
      deliveryFee, 
      depositAmount, 
      isPublic 
    } = parsed.data;

    // 📍 EXTRACTION DES DONNÉES DE RETRAIT
    const pickupAddress = (formData.get("pickupAddress") as string) || "Adresse de la boutique";
    const pickupLatStr = formData.get("pickupLat");
    const pickupLngStr = formData.get("pickupLng");
    
    const pickupLat = pickupLatStr ? parseFloat(pickupLatStr as string) : null;
    const pickupLng = pickupLngStr ? parseFloat(pickupLngStr as string) : null;

    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 🚨 KOLISYNC TRUST ENGINE : Évaluation du risque au moment de la création
    const riskAnalysis = await checkCustomerRiskAction(customerPhone);
    const isHighRisk = riskAnalysis.status === "DANGER" || riskAnalysis.status === "WARNING";

    const initialStatus = isPublic ? "AVAILABLE_PUBLIC" : "PENDING";

    const createdOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          tenantId: session.tenantId,
          customerName,
          customerPhone,
          deliveryAddress,
          commune,
          amountDue,
          deliveryFee, 
          depositAmount: depositAmount || 0, 
          pickupAddress: pickupAddress.trim(),
          pickupLat,
          pickupLng,
          packageStatus: initialStatus,
          cashStatus: "UNCOLLECTED",
          isPublic: isPublic,
          securityPin: generatedPin,
          socialContribution: 100, 
        },
      });

      await tx.packageEvent.create({
        data: {
          tenantId: session.tenantId,
          orderId: newOrder.id,
          authorId: session.userId,
          toStatus: initialStatus,
          logicalTs: Math.floor(Date.now() / 1000), 
          // Insertion du motif exact du Trust Engine dans l'historique
          reason: isHighRisk 
            ? `⚠️ ALERTE FRAUDE KOLISYNC : ${riskAnalysis.lastReason}` 
            : (isPublic ? "Publié sur la Bourse Globale" : "Création manuelle"),
        },
      });

      return newOrder;
    });

    // ENVOI DU SMS AU CLIENT
    const trackingId = createdOrder.id.slice(-6).toUpperCase();
    sendDeliveryPinSMS(
      createdOrder.customerPhone, 
      createdOrder.customerName, 
      createdOrder.securityPin!, 
      trackingId
    );

  } catch (error) {
    console.error("🔥 Erreur Prisma lors de la création :", error);
    return { error: "Une erreur est survenue lors de la création de l'expédition." };
  }

  revalidatePath("/b2b");
  redirect("/b2b");
}

export async function dispatchPackagesAction(prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== "OWNER" && session.role !== "DISPATCHER")) {
      return { error: "Action non autorisée." };
    }
  
    if (!formData || typeof formData.get !== 'function') {
      return { error: "Données invalides." };
    }

    const driverId = formData.get("driverId") as string;
    const packageIdsStr = formData.get("packageIds") as string;
  
    if (!driverId || !packageIdsStr) {
      return { error: "Veuillez sélectionner un livreur et au moins un colis." };
    }
  
    try {
      const packageIds = JSON.parse(packageIdsStr) as string[];
      const ordersToDispatch = await prisma.order.findMany({
        where: { id: { in: packageIds }, tenantId: session.tenantId },
      });
  
      const newEvents = ordersToDispatch.map((order) => {
        return {
          tenantId: session.tenantId,
          orderId: order.id,
          authorId: session.userId,
          fromStatus: order.packageStatus,
          toStatus: "DISPATCHED" as const, 
          logicalTs: Math.floor(Date.now() / 1000), 
        };
      });
  
      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: { id: { in: packageIds }, tenantId: session.tenantId },
          data: { driverId, packageStatus: "DISPATCHED" },
        });
        await tx.packageEvent.createMany({ data: newEvents });
      });
  
    } catch (error) {
      console.error("🔥 Erreur lors du dispatching :", error);
      return { error: "Erreur lors du dispatching." };
    }
  
    revalidatePath("/b2b/packages");
    return { success: true };
}
