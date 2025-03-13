"use server";

import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import { z } from "zod";

import { StatsResult } from "@/types/stats";

// Configuration minimale de PDF.js sans worker
const PDFJS = require("pdfjs-dist/legacy/build/pdf");
PDFJS.GlobalWorkerOptions.workerSrc = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FileSchema = z.object({
  type: z.string(),
  name: z.string(),
});

// Fonction optimisée d'extraction de texte PDF
export const extractTextFromPdf = async (buffer: ArrayBuffer) => {
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
};

// Fonction pour convertir un fichier en base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function parseStats(formData: FormData): Promise<StatsResult> {
  try {
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Aucun fichier n'a été fourni");
    }

    const validatedFile = FileSchema.parse(file);
    let content = "";
    let messages: ChatCompletionMessageParam[] = [];

    // Gestion différente selon le type de fichier
    if (validatedFile.type.startsWith("image/")) {
      // Pour les images
      const base64Image = await fileToBase64(file);
      messages = [
        {
          role: "system",
          content: `Tu es un assistant spécialisé dans l'extraction de statistiques sportives depuis des images.
          Analyse l'image fournie et extrait les statistiques pertinentes.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extrais les statistiques sportives de cette image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ];
    } else if (validatedFile.type === "application/pdf") {
      // Pour les PDFs
      const bytes = await file.arrayBuffer();
      content = await extractTextFromPdf(bytes);
      messages = [
        {
          role: "system",
          content: `Tu es un assistant spécialisé dans l'extraction de statistiques sportives.`,
        },
        {
          role: "user",
          content: content,
        },
      ];
    } else {
      // Pour les fichiers texte
      const bytes = await file.arrayBuffer();
      content = new TextDecoder().decode(bytes);
      messages = [
        {
          role: "system",
          content: `Tu es un assistant spécialisé dans l'extraction de statistiques sportives.`,
        },
        {
          role: "user",
          content: content,
        },
      ];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages,
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
    return {
      success: true,
      data: extractedStats,
    };
  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
