"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AthleteForm } from "@/components/forms/athlete-form";

export function AthleteDialogCreate() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Vérifiez si l'utilisateur doit voir le formulaire
    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="));
    if (userRole && userRole.split("=")[1] === "ATHLETE") {
      setShowDialog(true);
    }
  }, []);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
