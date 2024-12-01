import { NextResponse } from "next/server";
import { getTopAthletes } from "@/actions/get-athlete";

export async function GET(request: Request) {
  try {
    const athletes = await getTopAthletes();
    return NextResponse.json(athletes);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des athlètes" },
      { status: 500 },
    );
  }
}
