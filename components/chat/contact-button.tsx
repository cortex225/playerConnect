"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactButtonProps {
  contactId: string;
  contactName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Bouton pour initier une conversation avec un contact
 * Gère automatiquement les vérifications de sécurité et les approbations parentales
 */
export function ContactButton({
  contactId,
  contactName,
  variant = "default",
  size = "default",
  className,
}: ContactButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const handleContact = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contacts/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId }),
      });

      const data = await response.json();

      if (response.status === 403 && data.needsApproval) {
        // Afficher le dialogue d'approbation nécessaire
        setShowApprovalDialog(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'initiation du contact");
      }

      // Succès - rediriger vers la messagerie avec auto-sélection du contact
      // Déterminer le rôle basé sur l'URL actuelle
      const currentPath = window.location.pathname;
      const isRecruiter = currentPath.includes("/recruiter/");
      const messagesPath = isRecruiter
        ? "/dashboard/recruiter/messages"
        : "/dashboard/athlete/messages";

      toast.success(data.message || "Conversation ouverte");

      // Passer le contactId via URL pour auto-sélection
      router.push(`${messagesPath}?openContact=${contactId}`);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Impossible de contacter cette personne");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleContact}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 size-4" />
            Contacter
          </>
        )}
      </Button>

      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approbation parentale requise</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Pour votre sécurité, un parent ou tuteur doit approuver ce contact
                avant que vous puissiez envoyer des messages à{" "}
                <strong>{contactName}</strong>.
              </p>
              <p>
                Une demande d'approbation a été envoyée à l'email parental enregistré
                sur votre compte. Vous recevrez une notification une fois le contact
                approuvé.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  <strong>Pourquoi cette étape ?</strong>
                  <br />
                  Nous protégeons les mineurs en exigeant qu'un adulte responsable
                  approuve tous les nouveaux contacts avec des recruteurs.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>J'ai compris</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
