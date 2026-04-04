import { z } from "zod";

// DTO pour la page de connexion
export const loginSchema = z.object({
  identifier: z.string().min(1, "L'identifiant est requis"),
  pin: z.string().min(4, "Le code PIN doit faire au moins 4 caractères"),
});

// DTO pour la création d'un colis
export const createPackageSchema = z.object({
  customerName: z.string().min(2, "Le nom du client est requis (min 2 caractères)"),
  customerPhone: z.string().min(8, "Le numéro de téléphone est invalide"),
  deliveryAddress: z.string().optional(),
  commune: z.string().min(1, "La commune est obligatoire pour le bassin de courses"),
  amountDue: z.coerce.number().min(1, "Le montant à encaisser doit être supérieur à 0"),
  deliveryFee: z.coerce.number().min(0, "Les frais de livraison doivent être positifs").default(0),
  isPublic: z.boolean().optional().default(false),
  depositAmount: z.coerce.number().min(0, "La caution ne peut pas être négative").default(0),
});

// DTO pour l'inscription (création Tenant + Owner)
export const registerSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis (min 2 caractères)"),
  name:        z.string().min(2, "Le nom complet est requis (min 2 caractères)"),
  phone:       z.string().min(8, "Numéro de téléphone invalide"),
  pinCode:     z.string()
                 .length(4, "Le PIN doit faire exactement 4 chiffres")
                 .regex(/^\d{4}$/, "Le PIN doit contenir uniquement des chiffres"),
  // 🚨 GARDE-FOU BACKEND : Syntaxe Zod corrigée pour ta version
  acceptTerms: z.literal("on", {
    error: "Vous devez accepter les CGU et la Politique de Confidentialité.",
  }),
});

export const registerDriverSchema = z.object({
  name: z.string().min(2, "Le nom complet est requis (min 2 caractères)"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  pinCode: z.string()
             .length(4, "Le PIN doit faire exactement 4 chiffres")
             .regex(/^\d{4}$/, "Le PIN doit contenir uniquement des chiffres"),
  preferredCommune: z.string().min(2, "Veuillez choisir votre zone de prédilection"),
  // 🚨 GARDE-FOU BACKEND : Syntaxe Zod corrigée pour ta version
  acceptTerms: z.literal("on", {
    error: "Vous devez accepter les CGU et la Politique de Confidentialité.",
  }),
});

export type RegisterDriverInput = z.infer<typeof registerDriverSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
