import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          /**
           * Modèles EXEMPTÉS du RLS applicatif.
           */
          const EXEMPT_MODELS = new Set([
            "tenant",
            "socialwallet",
            "socialtransaction",
            "dispute",
            "customerrisk",
            "incidentlog",
          ]);

          const currentModel = model?.toLowerCase() ?? "";

          if (EXEMPT_MODELS.has(currentModel)) {
            return query(args);
          }

          const session = await getSession();
          const tenantId = session?.tenantId;

          if (!tenantId) {
            return query(args);
          }

          const safeArgs = { ...args } as Record<string, any>;

          // Opérations de lecture
          const READ_OPS = new Set([
            "findUnique", "findFirst", "findMany", "count", "aggregate"
          ]);

          // Opérations d'écriture (Modification / Suppression)
          const WRITE_OPS = new Set([
            "update", "updateMany", "delete", "deleteMany"
          ]);

          // --- 1. LOGIQUE DE LECTURE (Marketplace) ---
          if (READ_OPS.has(operation)) {
            if (currentModel === "order") {
              // Brèche contrôlée : Un livreur voit les colis de son Tenant 
              // OU les colis publiés sur la Bourse Globale
              safeArgs.where = {
                ...((safeArgs.where as object) ?? {}),
                OR: [
                  { tenantId },
                  { isPublic: true }
                ],
              };
            } else {
              // RLS Strict pour le reste (Clients, Staff, etc.)
              safeArgs.where = {
                ...((safeArgs.where as object) ?? {}),
                tenantId,
              };
            }
          }

          // --- 2. LOGIQUE D'ÉCRITURE (Isolation Totale) ---
          // On ne peut jamais modifier ou supprimer un colis qui n'est pas à nous
          if (WRITE_OPS.has(operation)) {
            safeArgs.where = {
              ...((safeArgs.where as object) ?? {}),
              tenantId,
            };
          }

          // --- 3. LOGIQUE DE CRÉATION ---
          if (operation === "create") {
            safeArgs.data = {
              ...((safeArgs.data as object) ?? {}),
              tenantId,
            };
          }

          if (operation === "createMany") {
            const data = safeArgs.data;
            safeArgs.data = Array.isArray(data)
              ? data.map((d: object) => ({ ...d, tenantId }))
              : { ...(data as object), tenantId };
          }

          return query(safeArgs);
        },
      },
    },
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
