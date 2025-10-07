"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Check, UserPlus, Upload, Search, Handshake } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Créez votre profil",
    description:
      "Inscrivez-vous en quelques secondes et choisissez votre rôle : Athlète, Recruteur ou Média.",
  },
  {
    icon: Upload,
    title: "Complétez vos informations",
    description:
      "Ajoutez vos statistiques, médias et performances pour créer un profil complet et attractif.",
  },
  {
    icon: Search,
    title: "Découvrez des opportunités",
    description:
      "Explorez notre réseau de talents et de recruteurs pour trouver les meilleures opportunités.",
  },
  {
    icon: Handshake,
    title: "Connectez-vous",
    description:
      "Entrez en contact directement et construisez des relations professionnelles durables.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-primary/5 to-background" />

      <motion.div style={{ opacity, scale }} className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Rejoignez PlayerConnect en 4 étapes simples
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent lg:block" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -50 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Step number */}
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-2xl border border-border/40 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <step.icon className="size-5" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Check mark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                    className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground lg:flex"
                  >
                    <Check className="size-5" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
