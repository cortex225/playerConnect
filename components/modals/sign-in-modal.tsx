"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/shared/icons";

// Ajout de la constante pour les redirections par défaut
const DEFAULT_LOGIN_REDIRECT = {
  ATHLETE: "/dashboard/athlete",
  RECRUITER: "/dashboard/recruiter",
} as const;

function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "ATHLETE" | "RECRUITER" | null
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    setSignInClicked(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        toast.error("Email ou mot de passe incorrect");
        setSignInClicked(false);
      } else {
        toast.success("Connexion réussie");
        document.cookie = `user_role=${selectedRole}; path=/;`;
        
        // Utilisation du chemin de redirection basé sur le rôle
        window.location.href = DEFAULT_LOGIN_REDIRECT[selectedRole];
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setSignInClicked(false);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    document.cookie = `user_role=${selectedRole}; path=/;`;
    setSignInClicked(true);
    try {
      await signIn("google", {
        callbackUrl: DEFAULT_LOGIN_REDIRECT[selectedRole],
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      setSignInClicked(false);
      toast.error("Une erreur est survenue avec la connexion Google");
    }
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!showSignInModal) {
      setSignInClicked(false);
      setEmail("");
      setPassword("");
      setSelectedRole(null);
    }
  }, [showSignInModal]);

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Image
              className="aspect-[1200/630] object-cover md:rounded-t-xl"
              src="/images/logo-1.png"
              width={200}
              height={200}
              alt="Logo Player Connect"
              priority
            />
          </a>
          <h3 className="font-urban text-2xl font-bold">Sign In</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email below to sign in to your account
          </p>
        </div>

        {/* Section de sélection de rôle */}
        <div className="flex flex-col items-center space-y-2 bg-background p-4 md:px-16">
          <div className="flex space-x-4">
            <Button
              variant={selectedRole === "ATHLETE" ? "default" : "outline"}
              onClick={() => setSelectedRole("ATHLETE")}
              size="sm"
              className="w-32"
            >
              Athlète
            </Button>
            <Button
              variant={selectedRole === "RECRUITER" ? "default" : "outline"}
              onClick={() => setSelectedRole("RECRUITER")}
              size="sm"
              className="w-32"
            >
              Recruteur
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 bg-background px-4 pb-8 md:px-16">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
              required
              disabled={signInClicked}
            />
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
              required
              disabled={signInClicked}
            />
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-blue-500 hover:bg-blue-600"
              disabled={signInClicked || !selectedRole}
            >
              {signInClicked ? (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              ) : null}
              Sign in with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-11 w-full rounded-xl"
            disabled={signInClicked || !selectedRole}
            onClick={handleGoogleSignIn}
          >
            {signInClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}
            Google
          </Button>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium hover:text-primary"
              onClick={() => setShowSignInModal(false)}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </Modal>
  );
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({ setShowSignInModal, SignInModal: SignInModalCallback }),
    [setShowSignInModal, SignInModalCallback],
  );
}
