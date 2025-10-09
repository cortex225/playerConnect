"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";

import { useSignInModal } from "@/components/modals/sign-in-modal";

export const ModalContext = createContext<{
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowSignInModal: () => {},
});

// Hook pour accéder facilement au contexte
export const useModals = () => useContext(ModalContext);

export default function ModalProvider({ children }: { children: ReactNode }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();

  return (
    <ModalContext.Provider
      value={{
        setShowSignInModal,
      }}
    >
      <SignInModal />
      {children}
    </ModalContext.Provider>
  );
}
