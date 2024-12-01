import * as z from "zod";

export const performanceFormSchema = z.object({
  date: z.date({
    required_error: "Une date est requise",
  }),
  positionId: z.string({
    required_error: "Une position est requise",
  }),
  stats: z.array(
    z.object({
      key: z.string(),
      value: z.number(),
    }),
  ),
});

export type PerformanceFormValues = z.infer<typeof performanceFormSchema>;

// Statistiques spécifiques par sport
export const sportStats = {
  BASKETBALL: [
    { key: "points", label: "Points" },
    { key: "rebounds", label: "Rebonds" },
    { key: "assists", label: "Passes décisives" },
    { key: "steals", label: "Interceptions" },
    { key: "blocks", label: "Contres" },
    { key: "fieldGoalPercentage", label: "% Tirs" },
    { key: "threePointPercentage", label: "% 3 Points" },
    { key: "freeThrowPercentage", label: "% Lancers francs" },
  ],
  SOCCER: [
    { key: "goals", label: "Buts" },
    { key: "assists", label: "Passes décisives" },
    { key: "shots", label: "Tirs" },
    { key: "shotsOnTarget", label: "Tirs cadrés" },
    { key: "passes", label: "Passes réussies" },
    { key: "tackles", label: "Tacles" },
    { key: "interceptions", label: "Interceptions" },
    { key: "minutesPlayed", label: "Minutes jouées" },
  ],
  FOOTBALL: [
    { key: "touchdowns", label: "Touchdowns" },
    { key: "yards", label: "Yards" },
    { key: "completions", label: "Passes complétées" },
    { key: "interceptions", label: "Interceptions" },
    { key: "tackles", label: "Plaquages" },
    { key: "sacks", label: "Sacks" },
    { key: "fieldGoals", label: "Field Goals" },
    { key: "punts", label: "Punts" },
  ],
  RUGBY: [
    { key: "tries", label: "Essais" },
    { key: "conversions", label: "Transformations" },
    { key: "penaltyGoals", label: "Pénalités" },
    { key: "tackles", label: "Plaquages" },
    { key: "meters", label: "Mètres parcourus" },
    { key: "turnovers", label: "Turnovers" },
    { key: "lineouts", label: "Touches gagnées" },
    { key: "scrums", label: "Mêlées gagnées" },
  ],
};
