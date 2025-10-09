/**
 * Script pour mettre à jour le rôle d'un utilisateur
 * Usage: npx tsx scripts/update-user-role.ts <email> <role>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = process.argv[2];
  const newRole = process.argv[3];

  if (!email || !newRole) {
    console.error("❌ Usage: npx tsx scripts/update-user-role.ts <email> <role>");
    console.error("   Rôles disponibles: USER, ATHLETE, RECRUITER, ADMIN");
    process.exit(1);
  }

  const validRoles = ["USER", "ATHLETE", "RECRUITER", "ADMIN"];
  if (!validRoles.includes(newRole.toUpperCase())) {
    console.error(`❌ Rôle invalide: ${newRole}`);
    console.error(`   Rôles disponibles: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        athletes: true,
        recruiters: true,
      },
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      process.exit(1);
    }

    console.log(`\n📊 Utilisateur trouvé:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rôle actuel: ${user.role}`);
    console.log(`   Profil athlète: ${user.athletes.length > 0 ? "✅ OUI" : "❌ NON"}`);
    console.log(`   Profil recruteur: ${user.recruiters.length > 0 ? "✅ OUI" : "❌ NON"}`);

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole.toUpperCase() },
    });

    console.log(`\n✅ Rôle mis à jour avec succès !`);
    console.log(`   ${user.role} → ${updatedUser.role}`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
