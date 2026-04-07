import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const subscription = await req.json();

    // SOLID & DB Hygiene: On écrase si le endpoint existe déjà, sinon on crée.
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: session.userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: session.userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur Push Subscription:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
