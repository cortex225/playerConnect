import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";

// Configuration minimale de PDF.js sans worker
const PDFJS = require("pdfjs-dist/legacy/build/pdf");
PDFJS.GlobalWorkerOptions.workerSrc = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction optimisée d'extraction de texte PDF
async function extractTextFromPdf(buffer: ArrayBuffer) {
  try {
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
    }).promise;

    let textContent = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => item.str).join(" ");
    }

    return textContent;
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte PDF:", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
}

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
    let content = "";

    if (file.type === "application/pdf") {
      content = await extractTextFromPdf(bytes);
    } else {
      content = Buffer.from(bytes).toString();
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
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
    console.error("Erreur lors du traitement:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    );
  }
}
