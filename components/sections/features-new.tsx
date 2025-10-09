"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart3,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Profils Professionnels",
    description:
      "Créez un profil complet avec vos statistiques, médias et performances pour vous démarquer.",
  },
  {
    icon: BarChart3,
    title: "Analytics Avancées",
    description:
      "Suivez vos performances avec des graphiques détaillés et des KPIs en temps réel.",
  },
  {
    icon: MessageSquare,
    title: "Messagerie Intégrée",
    description:
      "Communiquez directement avec les recruteurs et les athlètes sans intermédiaire.",
  },
  {
    icon: Video,
    title: "Galerie Média",
    description:
      "Partagez vos meilleurs moments avec des vidéos et photos haute qualité.",
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description:
      "Vos données sont protégées avec un chiffrement de bout en bout et une authentification sécurisée.",
  },
  {
    icon: TrendingUp,
    title: "Opportunités de Carrière",
    description:
      "Découvrez des opportunités adaptées à votre profil et développez votre réseau professionnel.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeaturesNew() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 sm:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tout ce dont vous avez besoin
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              pour réussir
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils professionnels conçus pour les athlètes, recruteurs et
            médias modernes.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>

              {/* Decorative gradient */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
