"use client";

/**
 * Helper pour appeler l'API de debug
 * @returns Les informations de session
 */
export async function fetchSessionInfo() {
  const response = await fetch("/api/auth/debug");
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Helper pour mettre à jour le rôle d'un utilisateur
 * @param role Le nouveau rôle
 * @param provider Le provider (optionnel)
 * @returns Le résultat de l'API
 */
export async function updateUserRole(role: string, provider?: string) {
  const response = await fetch("/api/user/update-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, provider }),
  });
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Helper pour se déconnecter
 */
export async function logoutUser() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
  
  // Rediriger vers la page de connexion
  window.location.href = "/auth/login";
} 