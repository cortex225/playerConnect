"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden py-24 sm:py-32">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20" />
        <motion.div
          className="absolute left-1/4 top-0 size-96 rounded-full bg-primary/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 size-96 rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/50 p-12 backdrop-blur-sm">
            {/* Decorative corner accents */}
            <div className="absolute left-0 top-0 size-24 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="absolute bottom-0 right-0 size-24 bg-gradient-to-tl from-purple-500/20 to-transparent" />

            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 inline-flex"
              >
                <div className="rounded-2xl bg-primary/10 p-4">
                  <Sparkles className="size-8 text-primary" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="font-urban text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              >
                Prêt à transformer
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  votre carrière sportive ?
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
              >
                Rejoignez des milliers d'athlètes et de recruteurs qui
                construisent leur avenir sur PlayerConnect. C'est gratuit pour
                commencer.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ size: "lg", rounded: "full" }),
                    "group gap-2 px-8 shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20",
                  )}
                >
                  Commencer maintenant
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                      rounded: "full",
                    }),
                    "gap-2 px-8",
                  )}
                >
                  Voir les tarifs
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6 text-sm text-muted-foreground"
              >
                Aucune carte de crédit requise • Configuration en 2 minutes
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
