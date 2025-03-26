"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecruiterForm } from "@/components/forms/recruiter-form";

export function RecruiterDialogCreate() {
  return (
    <Dialog defaultOpen={true}>
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
