"use client";

import { useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/hooks/use-session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface DeleteAccountModalProps {
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: (show: boolean) => void;
}

export function DeleteAccountModal({
  showDeleteAccountModal,
  setShowDeleteAccountModal,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { session } = useSession();

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte");
      }

      // Déconnexion après la suppression
      await signOut();

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });

      setShowDeleteAccountModal(false);
      router.push("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du compte.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={showDeleteAccountModal}
      onOpenChange={setShowDeleteAccountModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Êtes-vous sûr de vouloir supprimer votre compte ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes vos données seront
            définitivement supprimées.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteAccountModal(false)}
          >
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Supprimer mon compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
