import { PrismaClient } from "@prisma/client";

// Instance brute sans extension RLS pour les opérations système / marketplace
const prismaAdmin = new PrismaClient();

export default prismaAdmin;
