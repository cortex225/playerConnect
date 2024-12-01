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
import { RecruiterForm } from "@/components/forms/recruiter-form";

export function RecruiterDialogCreate() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Vérifiez si l'utilisateur doit voir le formulaire
    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="));
    if (userRole && userRole.split("=")[1] === "RECRUITER") {
      setShowDialog(true);
    }
  }, []);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complétez votre profil Recruiter</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour compléter votre profil.
          </DialogDescription>
        </DialogHeader>
        <RecruiterForm />
      </DialogContent>
    </Dialog>
  );
}
