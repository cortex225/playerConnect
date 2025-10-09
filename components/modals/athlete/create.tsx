"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/hooks/use-session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { AthleteForm } from "@/components/forms/athlete-form";

export function AthleteDialogCreate() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkAthleteProfile = async () => {
      if (loading || !session) return;

      try {
        // Vérifier si l'utilisateur a déjà un profil athlète
        const response = await fetch(
          `/api/athletes/check?userId=${session.id}`,
        );
        const data = await response.json();

        if (data.exists) {
          setProfileExists(true);

          // Rediriger vers le dashboard athlète si le profil existe déjà
          setTimeout(() => {
            router.push("/dashboard/athlete");
          }, 1000);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkAthleteProfile();
  }, [session, loading, router]);

  // Si on est en train de vérifier le profil, afficher un loader
  if (loading || checkingProfile) {
    return (
      <Dialog open={isOpen}>
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>Vérification en cours</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 size-8 animate-spin" />
            <p>Vérification de votre profil...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Si le profil existe déjà, afficher un message et rediriger
  if (profileExists) {
    return (
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil déjà existant</DialogTitle>
            <DialogDescription>
              Vous avez déjà un profil athlète. Vous allez être redirigé vers
              votre tableau de bord.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => router.push("/dashboard/athlete")}>
              Aller au tableau de bord
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Sinon, afficher le formulaire de création de profil
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complétez votre profil Athlète</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour compléter votre profil.
          </DialogDescription>
        </DialogHeader>
        <AthleteForm />
      </DialogContent>
    </Dialog>
  );
}
