import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log("API route called");
  try {
    const formData = await request.formData();
    console.log("FormData received");
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let content = "";
    if (file.type === "application/pdf") {
      const data = await pdf(buffer);
      content = data.text;
    } else {
      content = buffer.toString();
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant spécialisé dans l'extraction de statistiques sportives.
          Analyse le texte fourni et extrait les statistiques pertinentes.
          Retourne uniquement un tableau JSON avec la structure suivante:
          [{ "key": "string", "value": number }]
          Les clés possibles sont: goals, assists, shots, passes, minutes pour le football
          et points, rebounds, assists, steals, blocks pour le basketball.`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 10000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Pas de contenu retourné par l'API");
    }

    const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Pas de JSON trouvé dans la réponse");
    }

    const extractedStats = JSON.parse(jsonMatch[0]);
    return NextResponse.json(extractedStats);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du fichier", details: error.message },
      { status: 500 },
    );
  }
}
