"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionnel: Log l'erreur vers un service d'analytics
    console.error(error);
  }, [error]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-bold">Une erreur s&apos;est produite</h2>
        <p className="mb-4 text-muted-foreground">
          Désolé, quelque chose s&apos;est mal passé.
        </p>
        <Button
          onClick={() => reset()}
          variant="ghost"
          className="text-muted-foreground"
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}
