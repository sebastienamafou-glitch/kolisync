"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type RiskStatus = "SAFE" | "WARNING" | "DANGER" | "UNKNOWN" | "ERROR";

export interface RiskResponse {
  status: RiskStatus;
  reportCount?: number;
  lastReason?: string;
  error?: string;
}

export async function checkCustomerRiskAction(phone: string): Promise<RiskResponse> {
  try {
    const session = await getSession();
    // Seuls les vendeurs et répartiteurs B2B ont le droit d'interroger le radar
    if (!session || (session.role !== "OWNER" && session.role !== "DISPATCHER" && session.role !== "ADMIN")) {
      return { status: "ERROR", error: "Accès non autorisé au radar anti-fraude." };
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    
    // Inutile de requêter la base de données si le numéro n'est pas encore complet
    if (cleanPhone.length < 8) {
      return { status: "UNKNOWN" };
    }

    const riskProfile = await prisma.customerRisk.findUnique({
      where: { customerPhone: cleanPhone },
      include: {
        incidents: {
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      }
    });

    if (!riskProfile) {
      return { status: "SAFE" };
    }

    if (riskProfile.reportCount >= 3) {
      return { 
        status: "DANGER", 
        reportCount: riskProfile.reportCount,
        lastReason: riskProfile.incidents[0]?.reason || "Historique lourd de refus"
      };
    }

    return { 
      status: "WARNING", 
      reportCount: riskProfile.reportCount,
      lastReason: riskProfile.incidents[0]?.reason || "Signalement mineur"
    };

  } catch (error: unknown) {
    console.error("Erreur KoliSync Trust Engine:", error);
    return { status: "ERROR", error: "Impossible de joindre le radar." };
  }
}
