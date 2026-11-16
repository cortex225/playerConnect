const SPORTS = ["Basketball", "Soccer", "Football", "Rugby"];

const ATHLETE_STEPS = [
  {
    title: "Une fiche complète",
    body: "Taille, position, programme, équipe. Les statistiques de match s'ajoutent à la main ou depuis une feuille de stats importée.",
  },
  {
    title: "Tes meilleures séquences",
    body: "Photos et vidéos regroupées sur ton profil, avec les vues et les réactions des recruteurs.",
  },
  {
    title: "Ton calendrier de match",
    body: "Partage tes matchs et tournois. Un recruteur peut confirmer sa présence, en toute discrétion s'il le souhaite.",
  },
];

const RECRUITER_STEPS = [
  {
    title: "Recherche par critères",
    body: "Filtre par sport, position, niveau, catégorie et région. Trie par note de performance ou par progression.",
  },
  {
    title: "Profils comparables",
    body: "Les mêmes indicateurs pour chaque position, pondérés de la même façon. Fini les CV sportifs en PDF.",
  },
  {
    title: "Contact direct",
    body: "Messagerie intégrée avec historique. Pour un mineur, le contact passe par l'approbation d'un parent.",
  },
];

export function LandingRoles() {
  return (
    <>
      <div className="border-b bg-primary text-primary-foreground">
        <ul className="container flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 py-4">
          {SPORTS.map((sport) => (
            <li key={sport} className="font-display text-2xl uppercase">
              {sport}
            </li>
          ))}
          <li className="text-sm opacity-80 sm:ml-auto">
            Secondaire · Collégial · Universitaire
          </li>
        </ul>
      </div>

      <section className="container max-w-6xl py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-2 md:gap-12">
          <RoleColumn
            id="athletes"
            kicker="Pour les athlètes"
            title="Montre ce que tu fais sur le terrain."
            steps={ATHLETE_STEPS}
          />
          <RoleColumn
            id="recruteurs"
            kicker="Pour les recruteurs"
            title="Trouve le bon profil avant les autres."
            steps={RECRUITER_STEPS}
          />
        </div>
      </section>
    </>
  );
}

function RoleColumn({
  id,
  kicker,
  title,
  steps,
}: {
  id: string;
  kicker: string;
  title: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <p className="text-sm font-semibold text-muted-foreground">{kicker}</p>
      <h2 className="font-display mt-3 max-w-md text-4xl uppercase sm:text-5xl">
        {title}
      </h2>
      <ol className="mt-10 border-t">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[3rem_1fr] gap-x-4 border-b py-6"
          >
            <span className="font-display tabular text-3xl text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-prose leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
