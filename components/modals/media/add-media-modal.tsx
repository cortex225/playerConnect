"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MediaForm } from "@/components/forms/media-form";

function AddMediaModal({
  showAddMediaModal,
  setShowAddMediaModal,
}: {
  showAddMediaModal: boolean;
  setShowAddMediaModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal showModal={showAddMediaModal} setShowModal={setShowAddMediaModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <h3 className="font-urban text-2xl font-bold">Ajouter un média</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez une vidéo ou un highlight à votre profil
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-background px-4 py-8 md:px-16">
          <MediaForm />
        </div>
      </div>
    </Modal>
  );
}

export function useAddMediaModal() {
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  const AddMediaModalCallback = useCallback(() => {
    return (
      <AddMediaModal
        showAddMediaModal={showAddMediaModal}
        setShowAddMediaModal={setShowAddMediaModal}
      />
    );
  }, [showAddMediaModal, setShowAddMediaModal]);

  return useMemo(
    () => ({
      setShowAddMediaModal,
      AddMediaModal: AddMediaModalCallback,
    }),
    [setShowAddMediaModal, AddMediaModalCallback],
  );
}
