/**
 * Script de synchronisation des rôles utilisateurs
 *
 * Ce script met à jour automatiquement le rôle des utilisateurs en fonction
 * de l'existence de leur profil athlète ou recruteur
 *
 * Usage: npx tsx scripts/sync-user-roles.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncUserRoles() {
  console.log("🔄 Démarrage de la synchronisation des rôles utilisateurs...\n");

  try {
    // 1. Récupérer tous les utilisateurs avec leur profil athlète et recruteur
    const users = await prisma.user.findMany({
      include: {
        athletes: true,
        recruiters: true,
      },
    });

    console.log(`📊 ${users.length} utilisateurs trouvés\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      const currentRole = user.role;
      let newRole = "USER";

      // Déterminer le rôle en fonction des profils
      if (user.athletes) {
        newRole = "ATHLETE";
      } else if (user.recruiters) {
        newRole = "RECRUITER";
      }

      // Si le rôle a changé, le mettre à jour
      if (currentRole !== newRole) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole },
        });

        console.log(
          `✅ ${user.email}: ${currentRole} → ${newRole}`,
        );
        updated++;
      } else {
        console.log(`⏭️  ${user.email}: ${currentRole} (pas de changement)`);
        skipped++;
      }
    }

    console.log(`\n✨ Synchronisation terminée !`);
    console.log(`   - ${updated} utilisateur(s) mis à jour`);
    console.log(`   - ${skipped} utilisateur(s) ignorés (déjà à jour)`);
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncUserRoles();
