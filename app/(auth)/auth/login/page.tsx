"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { signIn } from "@/lib/auth-client";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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
      // Stocker le rôle sélectionné dans un cookie pour l'onboarding
      document.cookie = `selectedRole=${selectedRole}; path=/; max-age=3600`;

      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        toast.error("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      toast.success("Connexion réussie");
      router.push(callbackUrl);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
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
      // Stocker le rôle sélectionné dans un cookie pour l'onboarding
      document.cookie = `selectedRole=${selectedRole}; path=/; max-age=3600`;
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      toast.error("Une erreur est survenue avec la connexion Google");
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium"
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
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
            Connexion
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Entrez vos identifiants pour vous connecter
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
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline"
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

          <div className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              S'inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
