// lib/moderation.ts
import { prisma } from "@/lib/db";

/**
 * Liste de mots/expressions interdits pour protéger les mineurs
 * Dans un système de production, cette liste devrait être plus complète
 * et possiblement chargée depuis une base de données
 */
const BLOCKED_PATTERNS = [
  // Informations personnelles
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/gi, // Numéros de téléphone
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Emails
  /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi, // Adresses

  // Demandes de contact externe
  /\b(whatsapp|snapchat|instagram|facebook|telegram|discord|skype|zoom|meet)\b/gi,
  /\b(donne[- ]?moi|envoie[- ]?moi|partage)\s+(ton|ta|votre)\s+(num[eé]ro|t[eé]l[eé]phone|contact|email)/gi,

  // Propositions de rencontre
  /\b(rencontr(?:e|ons)|retrouv(?:e|ons)|viens|on se voit)\s+(en personne|irl|seul|à la maison)/gi,

  // Langage inapproprié (ajouter selon les besoins)
  /\b(vulgarit[eé]|insulte|menace)\b/gi,
];

/**
 * Patterns suspects qui nécessitent une révision manuelle
 */
const SUSPICIOUS_PATTERNS = [
  /\b(argent|payer|cadeau|r[eé]compense)\b/gi,
  /\b(secret|cache|ne dis pas)\b/gi,
  /\b(seul|sans tes parents|en priv[eé])\b/gi,
];

export interface ModerationResult {
  isBlocked: boolean;
  isSuspicious: boolean;
  reasons: string[];
  flaggedPatterns: string[];
}

/**
 * Modère le contenu d'un message
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  const result: ModerationResult = {
    isBlocked: false,
    isSuspicious: false,
    reasons: [],
    flaggedPatterns: [],
  };

  // Vérifier les patterns bloqués
  for (const pattern of BLOCKED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      result.isBlocked = true;
      result.reasons.push("Contenu interdit détecté");
      result.flaggedPatterns.push(...matches);
    }
  }

  // Vérifier les patterns suspects
  if (!result.isBlocked) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        result.isSuspicious = true;
        result.reasons.push("Contenu suspect nécessitant une révision");
        result.flaggedPatterns.push(...matches);
      }
    }
  }

  return result;
}

/**
 * Vérifie si un utilisateur est mineur (moins de 18 ans)
 */
export async function isMinor(userId: string): Promise<boolean> {
  const athlete = await prisma.athlete.findUnique({
    where: { userId },
    select: { dateOfBirth: true, age: true },
  });

  if (!athlete) {
    return false;
  }

  // Si on a la date de naissance, on calcule l'âge exact
  if (athlete.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(athlete.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 18;
  }

  // Sinon, on utilise l'âge déclaré
  return athlete.age ? athlete.age < 18 : false;
}

/**
 * Vérifie si deux utilisateurs peuvent communiquer
 */
export async function canCommunicate(
  userId: string,
  recipientId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Vérifier si l'utilisateur est un mineur
  const userIsMinor = await isMinor(userId);
  const recipientIsMinor = await isMinor(recipientId);

  // Si l'un des deux est mineur, vérifier l'approbation
  if (userIsMinor || recipientIsMinor) {
    const minorId = userIsMinor ? userId : recipientId;
    const adultId = userIsMinor ? recipientId : userId;

    // Vérifier si le contact est approuvé
    const approvedContact = await prisma.approvedContact.findUnique({
      where: {
        userId_contactId: {
          userId: minorId,
          contactId: adultId,
        },
      },
    });

    if (!approvedContact || !approvedContact.isActive) {
      return {
        allowed: false,
        reason: "Contact non approuvé. Un parent ou tuteur doit approuver ce contact.",
      };
    }

    // Vérifier si l'approbation n'a pas expiré
    if (approvedContact.expiresAt && approvedContact.expiresAt < new Date()) {
      return {
        allowed: false,
        reason: "L'approbation de contact a expiré.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Enregistre une action de modération
 */
export async function logModerationAction(data: {
  messageId?: string;
  userId: string;
  action: "FLAG" | "WARN" | "BLOCK" | "DELETE" | "APPROVE";
  reason: string;
  moderatedBy?: string;
  metadata?: Record<string, any>;
}) {
  await prisma.moderationLog.create({
    data: {
      messageId: data.messageId,
      userId: data.userId,
      action: data.action,
      reason: data.reason,
      moderatedBy: data.moderatedBy || "SYSTEM",
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
}

/**
 * Vérifie le consentement parental pour un mineur
 */
export async function hasParentalConsent(userId: string): Promise<boolean> {
  const athlete = await prisma.athlete.findUnique({
    where: { userId },
    select: {
      parentalConsentRequired: true,
      parentalConsentGiven: true,
    },
  });

  if (!athlete) {
    return false;
  }

  // Si le consentement n'est pas requis, on autorise
  if (!athlete.parentalConsentRequired) {
    return true;
  }

  // Sinon, vérifier si le consentement a été donné
  return athlete.parentalConsentGiven;
}

/**
 * Nettoie le contenu en retirant les informations sensibles
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;

  // Masquer les numéros de téléphone
  sanitized = sanitized.replace(
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    "[NUMÉRO MASQUÉ]"
  );

  // Masquer les emails
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "[EMAIL MASQUÉ]"
  );

  // Masquer les adresses
  sanitized = sanitized.replace(
    /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi,
    "[ADRESSE MASQUÉE]"
  );

  return sanitized;
}
