// Libellés français des sports et positions stockés en enum dans la base.

export const SPORT_LABELS: Record<string, string> = {
  BASKETBALL: "Basketball",
  SOCCER: "Soccer",
  FOOTBALL: "Football",
  RUGBY: "Rugby",
};

export const POSITION_LABELS: Record<string, string> = {
  POINT_GUARD: "Meneur",
  SHOOTING_GUARD: "Arrière",
  SMALL_FORWARD: "Ailier",
  POWER_FORWARD: "Ailier fort",
  CENTER: "Pivot",
  FORWARD: "Attaquant",
  MIDFIELDER: "Milieu",
  DEFENDER: "Défenseur",
  GOALKEEPER: "Gardien",
  QUARTERBACK: "Quart-arrière",
  RUNNING_BACK: "Porteur de ballon",
  WIDE_RECEIVER: "Receveur éloigné",
  TIGHT_END: "Ailier rapproché",
  OFFENSIVE_LINE: "Ligne offensive",
  LINEBACKER: "Secondeur",
  DEFENSIVE_LINE: "Ligne défensive",
  CORNERBACK: "Demi de coin",
  SAFETY: "Maraudeur",
  KICKER: "Botteur",
  PUNTER: "Dégageur",
  PROP: "Pilier",
  HOOKER: "Talonneur",
  LOCK: "Deuxième ligne",
  FLANKER: "Troisième ligne aile",
  NUMBER_EIGHT: "Numéro huit",
};

export function sportLabel(value?: string | null) {
  if (!value) return "Sport non précisé";
  return SPORT_LABELS[value] ?? value;
}

const FEMININE_LABELS: Record<string, string> = {
  POINT_GUARD: "Meneuse",
  SMALL_FORWARD: "Ailière",
  POWER_FORWARD: "Ailière forte",
  FORWARD: "Attaquante",
  DEFENDER: "Défenseure",
  GOALKEEPER: "Gardienne",
  FLANKER: "Troisième ligne aile",
};

export function positionLabel(value?: string | null, gender?: string | null) {
  if (!value || value === "N/A") return "Position à préciser";
  if (gender === "FEMININ" && FEMININE_LABELS[value]) {
    return FEMININE_LABELS[value];
  }
  return POSITION_LABELS[value] ?? value;
}
