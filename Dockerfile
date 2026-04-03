# ----------------------------------------------------
# Étape 1 : Base - Installation des dépendances système
# ----------------------------------------------------
FROM node:20-alpine AS base
# Installation de libc6-compat nécessaire pour Prisma sur Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ----------------------------------------------------
# Étape 2 : Dépendances - Installation des packages npm
# ----------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copie des fichiers de package
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installation des dépendances (y compris devDependencies pour Prisma)
RUN npm ci

# ----------------------------------------------------
# Étape 3 : Build
# ----------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

# 🚨 AJOUT : On définit un secret dummy pour le build ET on limite la RAM
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV JWT_SECRET="build_time_dummy_secret_only"
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED 1

# On limite les workers de Next.js pour éviter le WorkerError
RUN npm run build

# ----------------------------------------------------
# Étape 4 : Runner - L'image finale légère de production
# ----------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des assets statiques depuis le builder
COPY --from=builder /app/public ./public

# Configuration automatique du dossier standalone (nécessite d'éditer next.config.mjs)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
# Important : force l'écoute sur toutes les interfaces réseau (IPv4) dans le conteneur
ENV HOSTNAME "0.0.0.0"

# Démarrage du serveur Node généré par Next.js standalone
CMD ["node", "server.js"]
