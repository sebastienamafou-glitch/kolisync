import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Nettoyage profond de la base de données...');
  await prisma.incidentLog.deleteMany();
  await prisma.customerRisk.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.socialTransaction.deleteMany();
  await prisma.socialWallet.deleteMany();
  await prisma.packageEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('⏳ Hachage du code PIN universel (1234)...');
  const salt = await bcrypt.genSalt(10);
  const hashedPin = await bcrypt.hash('1234', salt);

  console.log('⏳ Création de l\'architecture Multi-Tenant...');
  const hqTenant = await prisma.tenant.create({ data: { name: 'KoliSync HQ', isPro: true } });
  const tenantA = await prisma.tenant.create({ data: { name: 'Boutique Alpha (Principal)' } });
  const tenantB = await prisma.tenant.create({ data: { name: 'Boutique Beta (Externe)' } });

  console.log('⏳ Création de la hiérarchie des Utilisateurs...');
  
  const adminHQ = await prisma.user.create({
    data: {
      tenantId: hqTenant.id, name: 'Admin HQ', email: 'admin@kolisync.com',
      phone: '0000000000', pinCode: hashedPin, role: 'ADMIN',
    },
  });

  const ownerA = await prisma.user.create({
    data: {
      tenantId: tenantA.id, name: 'Vendeur Alpha', email: 'vendeurA@kolisync.com',
      phone: '0100000001', pinCode: hashedPin, role: 'OWNER',
    },
  });

  const ownerB = await prisma.user.create({
    data: {
      tenantId: tenantB.id, name: 'Vendeur Beta', email: 'vendeurB@kolisync.com',
      phone: '0200000002', pinCode: hashedPin, role: 'OWNER',
    },
  });

  // Livreur 1 (Assigné par défaut au Tenant A) - 🚨 PROFIL TOTALEMENT APPROUVÉ (KYC + Véhicule)
  const driver1 = await prisma.user.create({
    data: {
      tenantId: tenantA.id, name: 'Livreur Alpha', email: 'alpha@kolisync.com',
      phone: '0500000001', pinCode: hashedPin, role: 'DRIVER', preferredCommune: 'Plateau', maxCashLimit: 50000,
      kycStatus: 'APPROVED',
      idDocumentUrl: 'https://placehold.co/600x400/png?text=CNI+Alpha',
      selfieUrl: 'https://placehold.co/600x400/png?text=Selfie+Alpha',
      drivingLicenseUrl: 'https://placehold.co/600x400/png?text=Permis+Alpha',
      vehicleRegistrationUrl: 'https://placehold.co/600x400/png?text=Carte+Grise+Alpha',
      licensePlate: '1234 AB 01',
      emergencyContact: 'Mère: 0700000000',
      kycSubmittedAt: new Date(Date.now() - 86400000), // Soumis il y a 24h
      kycVerifiedAt: new Date()
    },
  });

  // Livreur 2 (Assigné par défaut au Tenant B) - 🚨 PROFIL EN ATTENTE POUR TESTER LE DASHBOARD HQ
  const driver2 = await prisma.user.create({
    data: {
      tenantId: tenantB.id, name: 'Livreur Beta', email: 'beta@kolisync.com',
      phone: '0500000002', pinCode: hashedPin, role: 'DRIVER', preferredCommune: 'Cocody', maxCashLimit: 50000,
      kycStatus: 'PENDING',
      idDocumentUrl: 'https://placehold.co/600x400/png?text=CNI+Beta',
      selfieUrl: 'https://placehold.co/600x400/png?text=Selfie+Beta',
      drivingLicenseUrl: 'https://placehold.co/600x400/png?text=Permis+Beta',
      vehicleRegistrationUrl: 'https://placehold.co/600x400/png?text=Carte+Grise+Beta',
      licensePlate: '9876 XYZ 02',
      emergencyContact: 'Frère: 0500000099',
      kycSubmittedAt: new Date()
    },
  });

  console.log('⏳ Création des Portefeuilles Sociaux...');
  const wallet1 = await prisma.socialWallet.create({ data: { userId: driver1.id, balance: 1500 } });
  const wallet2 = await prisma.socialWallet.create({ data: { userId: driver2.id, balance: 0 } });

  console.log('⏳ Scénario : Injection d\'un profil client frauduleux...');
  const badCustomer = await prisma.customerRisk.create({
    data: { customerPhone: '0799999999', reportCount: 3 }
  });
  await prisma.incidentLog.create({
    data: { riskProfileId: badCustomer.id, tenantId: tenantA.id, reason: 'Refus de payer, comportement agressif' }
  });

  console.log('⏳ Injection de la volumétrie des Commandes (E2E Scenarios)...');
  
  // Coordonnées GPS factices pour Abidjan
  const locPlateau = { lat: 5.320357, lng: -4.016107 };
  const locCocody = { lat: 5.356133, lng: -3.988583 };

  // --- SCÉNARIOS TENANT A ---
  // 1. Commande en attente (PENDING)
  await prisma.order.create({
    data: {
      tenantId: tenantA.id, customerName: 'Client E2E En Attente', customerPhone: '0700000010', 
      commune: 'Treichville', deliveryAddress: 'Avenue 16', amountDue: 10000, deliveryFee: 1000, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'PENDING', securityPin: '1111',
      events: {
        create: [{ tenantId: tenantA.id, authorId: ownerA.id, toStatus: 'PENDING', logicalTs: 1, reason: 'Création initiale' }]
      }
    }
  });

  // 2. Commande assignée mais pas encore récupérée (DISPATCHED)
  await prisma.order.create({
    data: {
      tenantId: tenantA.id, driverId: driver1.id, customerName: 'Client E2E Assigné', customerPhone: '0700000011', 
      commune: 'Marcory', amountDue: 15000, deliveryFee: 1500, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'DISPATCHED', securityPin: '2222',
      events: {
        create: [
          { tenantId: tenantA.id, authorId: ownerA.id, toStatus: 'PENDING', logicalTs: 1 },
          { tenantId: tenantA.id, authorId: ownerA.id, fromStatus: 'PENDING', toStatus: 'DISPATCHED', logicalTs: 2, reason: 'Assignation au Livreur Alpha' }
        ]
      }
    }
  });

  // 3. Commande en cours de livraison avec GPS vérifié (IN_TRANSIT)
  await prisma.order.create({
    data: {
      tenantId: tenantA.id, driverId: driver1.id, customerName: 'Client E2E En Route', customerPhone: '0700000012', 
      commune: 'Cocody', amountDue: 25000, deliveryFee: 2000, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'IN_TRANSIT', securityPin: '3333',
      events: {
        create: [
          { tenantId: tenantA.id, authorId: ownerA.id, toStatus: 'PENDING', logicalTs: 1 },
          { tenantId: tenantA.id, authorId: ownerA.id, fromStatus: 'PENDING', toStatus: 'DISPATCHED', logicalTs: 2 },
          { tenantId: tenantA.id, authorId: driver1.id, fromStatus: 'DISPATCHED', toStatus: 'IN_TRANSIT', logicalTs: 3, latitude: locPlateau.lat, longitude: locPlateau.lng, reason: '✅ POSITION VÉRIFIÉE : Retrait confirmé sur place.' }
        ]
      }
    }
  });

  // 4. Commande livrée (Test du Plafond Cash)
  const orderDeliveredA = await prisma.order.create({
    data: {
      tenantId: tenantA.id, driverId: driver1.id, customerName: 'Client E2E Livré', customerPhone: '0700000013', 
      commune: 'Yopougon', amountDue: 45000, deliveryFee: 1000, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'DELIVERED_VERIFIED', cashStatus: 'HELD_BY_DRIVER', securityPin: '4444', socialContribution: 100,
      events: {
        create: [{ tenantId: tenantA.id, authorId: driver1.id, toStatus: 'DELIVERED_VERIFIED', logicalTs: 4, reason: 'Livraison validée par code PIN' }]
      }
    }
  });

  await prisma.socialTransaction.create({
    data: { walletId: wallet1.id, orderId: orderDeliveredA.id, amount: 100, type: 'CONTRIBUTION' }
  });

  // 5. Commande en Litige (CONFLICT)
  const orderConflictA = await prisma.order.create({
    data: {
      tenantId: tenantA.id, driverId: driver1.id, customerName: 'Client E2E Litige', customerPhone: '0799999999', 
      commune: 'Abobo', amountDue: 20000, deliveryFee: 1500, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'CONFLICT', securityPin: '5555',
      events: {
        create: [
          { tenantId: tenantA.id, authorId: driver1.id, toStatus: 'CONFLICT', logicalTs: 5, latitude: locCocody.lat, longitude: locCocody.lng, reason: 'Signalement: REFUSAL_TO_PAY | 📍 Preuve GPS enregistrée.' }
        ]
      }
    }
  });

  await prisma.dispute.create({
    data: {
      orderId: orderConflictA.id, driverId: driver1.id, reason: 'REFUSAL_TO_PAY', 
      driverComment: 'Client agressif, refuse de payer le colis.',
      latitude: locCocody.lat, longitude: locCocody.lng
    }
  });

  // --- SCÉNARIOS BOURSE GLOBALE (Cross-Tenant) ---
  await prisma.order.create({
    data: {
      tenantId: tenantA.id, customerName: 'Opportunité Publique 1', customerPhone: '0700000030', 
      commune: 'Plateau', amountDue: 50000, deliveryFee: 3000, depositAmount: 5000, 
      pickupAddress: 'Boutique Alpha, Plateau', pickupLat: locPlateau.lat, pickupLng: locPlateau.lng,
      packageStatus: 'AVAILABLE_PUBLIC', isPublic: true, securityPin: '8888',
      events: {
        create: [{ tenantId: tenantA.id, authorId: ownerA.id, toStatus: 'AVAILABLE_PUBLIC', logicalTs: 1, reason: 'Publié sur la Bourse Globale' }]
      }
    }
  });

  await prisma.order.create({
    data: {
      tenantId: tenantB.id, customerName: 'Opportunité Publique 2', customerPhone: '0700000031', 
      commune: 'Adjame', amountDue: 18000, deliveryFee: 1500, depositAmount: 0,
      pickupAddress: 'Boutique Beta, Cocody', pickupLat: locCocody.lat, pickupLng: locCocody.lng,
      packageStatus: 'AVAILABLE_PUBLIC', isPublic: true, securityPin: '9999',
      events: {
        create: [{ tenantId: tenantB.id, authorId: ownerB.id, toStatus: 'AVAILABLE_PUBLIC', logicalTs: 1, reason: 'Publié sur la Bourse Globale' }]
      }
    }
  });

  console.log('✅ E2E Seed complété avec succès.');
  console.log('--- CREDENTIALS DE TEST (PIN: 1234) ---');
  console.log(`👑 Admin HQ   : 0000000000`);
  console.log(`🏪 Vendeur A  : 0100000001`);
  console.log(`🏪 Vendeur B  : 0200000002`);
  console.log(`🛵 Livreur 1  : 0500000001 (✅ Approuvé - ⚠️ Proche limite cash)`);
  console.log(`🛵 Livreur 2  : 0500000002 (⏳ En attente de validation KYC)`);
  console.log(`\n🚨 Numéro client blacklisté pour vos tests de création : 0799999999`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur critique lors du seed E2E:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
