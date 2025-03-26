"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AthleteForm } from "@/components/forms/athlete-form";

export function AthleteDialogCreate() {
  return (
    <Dialog defaultOpen={true}>
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
