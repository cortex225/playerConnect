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
import Link from "next/link";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Icons } from "@/components/shared/icons";

interface SignInModalProps {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
  onSignUpClick?: () => void;
}

function SignInModal({
  showSignInModal,
  setShowSignInModal,
  onSignUpClick,
}: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "ATHLETE" | "RECRUITER" | null
  >(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    setLoading(true);
    try {
      await signIn.email({
        email,
        password,
        callbackURL: `/select-role?role=${selectedRole}`,
      });
      toast.success("Connexion réussie");
    } catch (error) {
      // Si l'erreur indique que l'utilisateur n'existe pas, on tente de créer un compte
      try {
        await signUp.email({
          email,
          password,
          name: email.split("@")[0], // Utilise la partie locale de l'email comme nom par défaut
          callbackURL: `/select-role?role=${selectedRole}`,
        });
        toast.success("Compte créé et connecté avec succès");
      } catch (signUpError) {
        console.error("Erreur de création de compte:", signUpError);
        toast.error("Impossible de créer le compte");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }
    setLoading(true);
    try {
      document.cookie = `selectedRole=${selectedRole}; path=/; max-age=3600`;
      await signIn.social({
        provider: "google",
        callbackURL: `/select-role?role=${selectedRole}&provider=google`,
      });
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      toast.error("Une erreur est survenue avec la connexion Google");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showSignInModal) {
      setLoading(false);
      setEmail("");
      setPassword("");
      setSelectedRole(null);
    }
  }, [showSignInModal]);

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <Card className="w-full overflow-hidden md:max-w-md">
        <CardHeader className="space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Image
              className="mx-auto aspect-[1200/630] object-cover md:rounded-t-xl"
              src="/images/logo-1.png"
              width={200}
              height={200}
              alt="Logo Player Connect"
              priority
            />
          </a>
          <CardTitle className="font-urban text-2xl font-bold">
            Connexion
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Entrez vos identifiants pour vous connecter
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:px-16">
          <div className="flex justify-center space-x-4">
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

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                  onClick={() => setShowSignInModal(false)}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={loading || !selectedRole}
            >
              {loading ? (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              ) : null}
              Se connecter avec Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className={cn("h-11 w-full gap-2 rounded-xl")}
            disabled={loading || !selectedRole}
            onClick={handleGoogleSignIn}
          >
            {loading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}
            Google
          </Button>
        </CardContent>
      </Card>
    </Modal>
  );
}
export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(
    ({ onSignUpClick }: { onSignUpClick?: () => void } = {}) => {
      return (
        <SignInModal
          showSignInModal={showSignInModal}
          setShowSignInModal={setShowSignInModal}
          onSignUpClick={onSignUpClick}
        />
      );
    },
    [showSignInModal, setShowSignInModal],
  );

  return useMemo(
    () => ({ setShowSignInModal, SignInModal: SignInModalCallback }),
    [setShowSignInModal, SignInModalCallback],
  );
}
