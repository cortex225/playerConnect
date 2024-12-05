import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          Cette page n&apos;existe pas.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "text-muted-foreground"
          )}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
