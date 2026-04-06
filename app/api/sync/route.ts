// app/api/sync/route.ts
import { NextResponse } from "next/server";
import { verifyDeliveryAction } from "@/app/actions/delivery";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const results = [];

    for (const event of events) {
      if (event.actionType === "DELIVERY_PIN") {
        const result = await verifyDeliveryAction(event.orderId, event.payload as string);
        
        // 🚨 CORRECTION TS : Type Narrowing sécurisé (on vérifie que 'error' existe)
        const hasError = result && typeof result === "object" && "error" in result;
        
        results.push({ id: event.id, status: hasError ? "error" : "success" });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });

  } catch (error) {
    console.error("🔥 Erreur critique API Sync :", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
