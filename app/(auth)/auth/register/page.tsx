"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { signUp } from "@/lib/auth-client";
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
import { Icons } from "@/components/shared/icons";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "ATHLETE" | "RECRUITER" | null
  >(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      // Stocker le rôle sélectionné dans un cookie pour l'onboarding
      document.cookie = `selectedRole=${selectedRole}; path=/; max-age=3600`;

      const result = await signUp.email({
        email,
        password,
        name,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        toast.error("Une erreur est survenue lors de l'inscription");
        setLoading(false);
        return;
      }

      toast.success("Compte créé avec succès");
      router.push(callbackUrl);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error("Une erreur est survenue lors de l'inscription");
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center text-sm font-medium md:left-8 md:top-8"
      >
        <Icons.chevronLeft className="mr-2 size-4" />
        Retour
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <Link href={siteConfig.url} className="flex justify-center">
            <Image
              src="/images/logo-1.png"
              width={200}
              height={200}
              alt="Logo Player Connect"
              priority
            />
          </Link>
          <CardTitle className="font-urban text-2xl font-bold">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Inscrivez-vous pour commencer
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:px-16 md:py-8">
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

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
                required
                disabled={loading}
              />
            </div>

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
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Au moins 8 caractères
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              Créer un compte
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
