"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function HeroLandingNew() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-1/4 top-1/4 size-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex"
          >
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm", rounded: "full" }),
                "group gap-2 px-4 py-2",
              )}
            >
              <Sparkles className="size-4 text-primary transition-transform group-hover:rotate-12" />
              <span className="text-sm font-medium">
                Connectez-vous avec les meilleurs talents du sport
              </span>
            </Link>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-urban text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Où le talent
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                rencontre l'opportunité
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            PlayerConnect réunit athlètes, recruteurs et médias dans un
            écosystème transparent et efficace. Construisez votre carrière,
            découvrez des talents, racontez des histoires inspirantes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: "lg", rounded: "full" }),
                "group gap-2 px-8 text-base shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20",
              )}
            >
              Commencer gratuitement
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#demo"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "lg",
                  rounded: "full",
                }),
                "group gap-2 px-8 text-base",
              )}
            >
              <Play className="size-4 transition-transform group-hover:scale-110" />
              Voir la démo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border/40 pt-8"
          >
            {[
              { value: "10K+", label: "Athlètes" },
              { value: "500+", label: "Recruteurs" },
              { value: "1M+", label: "Connexions" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-3xl font-bold sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
