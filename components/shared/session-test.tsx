"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SessionTest() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/debug");

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données de session",
        );
      }

      const data = await response.json();
      setSessionInfo(data);
    } catch (error) {
      console.error("Erreur:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionInfo();
  }, []);

  if (loading && !sessionInfo) {
    return (
      <Alert className="mt-4">
        <AlertTitle>Chargement des informations de session...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" className="mt-2" onClick={fetchSessionInfo}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  if (!sessionInfo) {
    return null;
  }

  const { serverSession, userSession, status } = sessionInfo;

  return (
    <Alert className="mt-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between">
        <AlertTitle>Informations de session (debug)</AlertTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Réduire" : "Détails"}
        </Button>
      </div>

      <AlertDescription>
        <div className="mt-2">
          <div className="text-sm">
            <span className="font-semibold">Statut:</span>{" "}
            <span
              className={
                status === "authenticated" ? "text-green-600" : "text-red-600"
              }
            >
              {status === "authenticated" ? "Authentifié" : "Non authentifié"}
            </span>
          </div>

          {userSession && (
            <div className="mt-1 text-sm">
              <span className="font-semibold">Utilisateur:</span>{" "}
              {userSession.name || userSession.email || userSession.id} (Rôle:{" "}
              {userSession.role})
            </div>
          )}

          {expanded && (
            <div className="mt-4">
              <p className="mb-1 font-semibold">Session serveur:</p>
              <pre className="max-h-32 overflow-auto rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
                {JSON.stringify(serverSession, null, 2)}
              </pre>

              {userSession && (
                <>
                  <p className="mb-1 mt-2 font-semibold">
                    Session utilisateur:
                  </p>
                  <pre className="max-h-32 overflow-auto rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
                    {JSON.stringify(userSession, null, 2)}
                  </pre>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchSessionInfo}
              >
                Rafraîchir
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
