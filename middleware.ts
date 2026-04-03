import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ❌ Plus de fallback silencieux — si JWT_SECRET manque, l'app crashe explicitement
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("[KoliSync] JWT_SECRET is not defined. Set it in your .env file.");
}
const JWT_SECRET = new TextEncoder().encode(rawSecret);

// Routes /b2b réservées aux OWNER uniquement (hors accès DISPATCHER)
const OWNER_ONLY_PATHS = ["/b2b/settings", "/b2b/reconciliation", "/b2b/upgrade"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isB2BRoute = pathname.startsWith("/b2b");
  const isPWARoute = pathname.startsWith("/pwa");
  const isAdminRoute = pathname.startsWith("/admin"); // 🚨 Ajout de la route Admin

  // Si ce n'est ni B2B, ni PWA, ni ADMIN (ex: page d'accueil, api, etc.), on laisse passer
  if (!isB2BRoute && !isPWARoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("kolisync_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const role = payload.role as string;
    const tenantId = payload.tenantId as string;
    const userId = payload.userId as string;

    // ── RBAC : Isolation stricte des espaces par rôle ──────────────────────

    // 🚨 Protection GOD MODE : Seul le SUPERADMIN peut accéder à /admin
    if (isAdminRoute && role !== "SUPERADMIN") {
      // On le renvoie vers son espace légitime
      if (role === "DRIVER") return NextResponse.redirect(new URL("/pwa", request.url));
      return NextResponse.redirect(new URL("/b2b", request.url));
    }

    // Le SUPERADMIN a le droit de se balader partout (B2B, PWA, Admin)
    if (role === "SUPERADMIN") {
      // Pas de blocage pour le boss
    } else {
      // Un livreur ne peut pas accéder à l'espace vendeur
      if (isB2BRoute && role === "DRIVER") {
        return NextResponse.redirect(new URL("/pwa", request.url));
      }

      // Un vendeur/dispatcher ne peut pas accéder à l'app livreur
      if (isPWARoute && (role === "OWNER" || role === "DISPATCHER")) {
        return NextResponse.redirect(new URL("/b2b", request.url));
      }

      // Un dispatcher ne peut pas accéder aux routes réservées aux OWNER
      if (isB2BRoute && role === "DISPATCHER") {
        const isOwnerOnly = OWNER_ONLY_PATHS.some((p) => pathname.startsWith(p));
        if (isOwnerOnly) {
          return NextResponse.redirect(new URL("/b2b", request.url));
        }
      }
    }

    // ── Propagation du contexte vers les Server Components ─────────────────
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });

  } catch {
    // Token corrompu, modifié ou expiré → destruction du cookie et expulsion
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("kolisync_session");
    return response;
  }
}

// 🚨 Ne pas oublier de mettre à jour le matcher pour inclure /admin !
export const config = {
  matcher: ["/b2b/:path*", "/pwa/:path*", "/admin/:path*"],
};
