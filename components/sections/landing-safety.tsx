import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const RULES = [
  {
    title: "Contacts approuvés",
    body: "Un athlète de moins de 18 ans ne reçoit de messages que des recruteurs approuvés par son parent ou tuteur.",
  },
  {
    title: "Modération des messages",
    body: "Les messages sont analysés avant l'envoi. Coordonnées personnelles et propos déplacés sont bloqués et journalisés.",
  },
  {
    title: "Profil sous contrôle",
    body: "L'athlète décide quels matchs et événements sont publics, et peut retirer un média à tout moment.",
  },
];

export function LandingSafety() {
  return (
    <section className="container max-w-6xl py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Encadrement des mineurs
          </p>
          <h2 className="font-display mt-3 text-4xl uppercase sm:text-5xl">
            Des règles claires pour les 14 à 17 ans.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            La majorité des athlètes au secondaire et au cégep sont mineurs. La
            plateforme a été construite autour de ce fait, pas en rattrapage.
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {RULES.map((rule) => (
            <div key={rule.title} className="border-t-2 border-foreground pt-4">
              <dt className="font-semibold">{rule.title}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">
                {rule.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section className="bg-brand text-brand-foreground">
      <div className="container flex max-w-6xl flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
        <h2 className="font-display max-w-2xl text-5xl uppercase sm:text-6xl">
          La saison prochaine se prépare maintenant.
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}
          >
            Créer mon profil
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-brand-foreground/30 bg-transparent px-6 text-brand-foreground hover:bg-brand-foreground/10",
            )}
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    </section>
  );
}
