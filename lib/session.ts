import { headers } from "next/headers";

export interface SessionPayload {
  userId: string;
  role: string;
  tenantId: string;
}

/**
 * Lit le contexte utilisateur depuis les headers injectés par le middleware Edge.
 *
 * Le JWT est vérifié UNE SEULE FOIS par requête dans middleware.ts.
 * Ici on lit simplement les headers x-* déjà validés — pas de re-parsing JWT,
 * pas d'accès cookie, pas de dépendance à jose.
 *
 * Les headers x-* ne sont jamais exposés au client (Next.js les filtre),
 * donc on peut leur faire confiance dans les Server Components et Server Actions.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const h = await headers();

  const userId   = h.get("x-user-id");
  const role     = h.get("x-user-role");
  const tenantId = h.get("x-tenant-id");

  if (!userId || !role || !tenantId) return null;

  return { userId, role, tenantId };
}
