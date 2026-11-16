import Image from "next/image";

import { cn } from "@/lib/utils";

// Monogramme « PC » extrait du logo officiel, avec variante pour le thème sombre.
export function BrandLogo({
  className,
  withName = true,
}: {
  className?: string;
  withName?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Image
        src="/brand/pc-mark.png"
        alt=""
        width={42}
        height={28}
        className="h-7 w-auto dark:hidden"
        priority
      />
      <Image
        src="/brand/pc-mark-white.png"
        alt=""
        width={42}
        height={28}
        className="hidden h-7 w-auto dark:block"
        priority
      />
      {withName ? (
        <span className="font-heading text-lg font-extrabold uppercase tracking-wide">
          Player<span className="text-brand-ink">Connect</span>
        </span>
      ) : (
        <span className="sr-only">PlayerConnect</span>
      )}
    </span>
  );
}
