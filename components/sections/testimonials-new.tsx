"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Marc Dubois",
    role: "Athlète Professionnel",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc",
    content:
      "PlayerConnect a transformé ma carrière. J'ai pu me connecter avec des recruteurs internationaux et décrocher le contrat de mes rêves.",
    rating: 5,
  },
  {
    name: "Sophie Laurent",
    role: "Recruteuse Sportive",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    content:
      "La plateforme facilite énormément la recherche de talents. Les profils sont détaillés et les analytics m'aident à prendre les meilleures décisions.",
    rating: 5,
  },
  {
    name: "Thomas Martin",
    role: "Journaliste Sportif",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    content:
      "Un outil indispensable pour suivre les performances des athlètes et créer des contenus de qualité. L'interface est intuitive et moderne.",
    rating: 5,
  },
];

export default function TestimonialsNew() {
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
            Ce que disent
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              nos utilisateurs
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Découvrez comment PlayerConnect aide des milliers de professionnels
            du sport à atteindre leurs objectifs.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Quote icon */}
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Quote className="size-5" />
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="mb-6 text-muted-foreground">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="size-12 rounded-full"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
