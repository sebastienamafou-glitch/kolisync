"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prismaAdmin from "@/lib/prisma-admin"; // 🚨 INDISPENSABLE pour le login
import { loginSchema, registerSchema } from "@/lib/dtos";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("[KoliSync] JWT_SECRET is not defined.");
}
const JWT_SECRET = new TextEncoder().encode(rawSecret);

async function createSessionCookie(userId: string, role: string, tenantId: string) {
  const token = await new SignJWT({ userId, role, tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("kolisync_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function loginAction(prevState: unknown, formData: FormData) {
  let redirectPath = "";

  try {
    const data = Object.fromEntries(formData.entries());
    
    console.log("Données reçues :", data);

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Veuillez remplir tous les champs correctement." };
    }

    const { identifier, pin } = parsed.data;

    const user = await prismaAdmin.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user || !user.pinCode) {
      return { error: "Identifiant ou PIN incorrect." };
    }

    const isValidPin = await bcrypt.compare(pin, user.pinCode);
    if (!isValidPin) {
      return { error: "Identifiant ou PIN incorrect." };
    }

    await createSessionCookie(user.id, user.role, user.tenantId);
    
    // 🚨 FIX : Le routage intelligent selon le rôle (KISS)
    if (user.role === "SUPERADMIN") {
      redirectPath = "/admin";
    } else if (user.role === "DRIVER") {
      redirectPath = "/pwa";
    } else {
      // Pour OWNER et DISPATCHER
      redirectPath = "/b2b";
    }

  } catch (error) {
    console.error("Erreur Login:", error);
    return { error: "Erreur de connexion au serveur." };
  }

  // 🚨 Note architecturale : redirect() doit TOUJOURS être appelé en dehors du try/catch dans Next.js !
  if (redirectPath) redirect(redirectPath);
}
// ── registerAction ─────────────────────────────────────────────────────────

export async function registerAction(prevState: unknown, formData: FormData) {
  let redirectPath = "";

  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      // 🚨 FIX : Utiliser .issues pour la compatibilité TypeScript Zod
      return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const { companyName, name, phone, pinCode } = parsed.data;

    // 🚨 FIX : Recherche globale via prismaAdmin
    const existing = await prismaAdmin.user.findUnique({ where: { phone } });
    if (existing) {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }

    const hashedPin = await bcrypt.hash(pinCode, 12);

    const result = await prismaAdmin.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: companyName },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          phone,
          pinCode: hashedPin,
          role: "OWNER",
        },
      });

      // Initialisation du portefeuille social (Attention : W majuscule)
      await tx.socialWallet.create({
        data: { userId: user.id, balance: 0 },
      });

      return { user };
    });

    await createSessionCookie(result.user.id, result.user.role, result.user.tenantId);
    redirectPath = "/b2b";

  } catch {
    return { error: "Erreur lors de la création du compte." };
  }

  if (redirectPath) redirect(redirectPath);
}

// À ajouter tout en bas de app/actions/auth.ts
import { registerDriverSchema } from "@/lib/dtos"; // N'oublie pas de l'importer en haut si ce n'est pas fait

export async function registerDriverAction(prevState: unknown, formData: FormData) {
  let redirectPath = "";

  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerDriverSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const { name, phone, pinCode, preferredCommune } = parsed.data;

    const existing = await prismaAdmin.user.findUnique({ where: { phone } });
    if (existing) {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }

    const hashedPin = await bcrypt.hash(pinCode, 12);

    const result = await prismaAdmin.$transaction(async (tx) => {
      // 1. Création du "micro-tenant" pour le livreur indépendant
      const tenant = await tx.tenant.create({
        data: { name: `Flotte Indépendante - ${name}` },
      });

      // 2. Création du compte Livreur (avec un plafond de confiance de base)
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          phone,
          pinCode: hashedPin,
          role: "DRIVER",
          preferredCommune,
          maxCashLimit: 20000, // Plafond de départ strict pour limiter les risques
        },
      });

      // 3. Initialisation du portefeuille social
      await tx.socialWallet.create({
        data: { userId: user.id, balance: 0 },
      });

      return { user };
    });

    await createSessionCookie(result.user.id, result.user.role, result.user.tenantId);
    redirectPath = "/pwa"; // On le redirige direct vers l'application livreur !

  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de l'inscription." };
  }

  if (redirectPath) redirect(redirectPath);
}

// ── logoutAction ───────────────────────────────────────────────────────────

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("kolisync_session");
  redirect("/");
}
