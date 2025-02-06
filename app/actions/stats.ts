"use server";

import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import { z } from "zod";

import { StatsResult } from "@/types/stats";

// Configuration du worker PDF.js pour Next.js
if (typeof window === "undefined") {
  GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.entry");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FileSchema = z.object({
  type: z.string(),
  name: z.string(),
});

// Configuration minimale
export const extractTextFromPdf = async (buffer: ArrayBuffer) => {
  const pdf = await getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true, // Désactive le chargement des polices
    disableAutoFetch: true, // Désactive le chargement asynchrone
  }).promise;

  let textContent = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await page.getTextContent();
    textContent += text.items.map((item: any) => item.str).join(" ");
  }

  return textContent;
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

    messages.push({
      role: "system",
      content: `Les statistiques possibles sont :
      - Pour le football : goals, assists, shots, passes, minutes
      - Pour le basketball : points, rebounds, assists, steals, blocks
      
      Retourne uniquement un tableau JSON avec la structure suivante:
      [{ "key": "string", "value": number }]
      
      Exemple de réponse valide:
      [{"key": "goals", "value": 2}, {"key": "assists", "value": 1}]`,
    });

    const completion = await openai.chat.completions.create({
      model: validatedFile.type.startsWith("image/")
        ? "gpt-4o-mini"
        : "gpt-4o-mini",
      messages,
      max_tokens: 10000,
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("Pas de résultat de l'API OpenAI");
    }
    console.log(result);
    try {
      const parsedResult = JSON.parse(result);
      if (!Array.isArray(parsedResult)) {
        throw new Error("Le résultat n'est pas un tableau valide");
      }

      const isValidStats = parsedResult.every(
        (stat) =>
          typeof stat === "object" &&
          stat !== null &&
          "key" in stat &&
          "value" in stat &&
          typeof stat.key === "string" &&
          typeof stat.value === "number",
      );

      if (!isValidStats) {
        throw new Error("Format des statistiques invalide");
      }

      return { success: true, data: parsedResult };
    } catch (jsonError) {
      console.error("Erreur lors du parsing JSON:", jsonError);
      throw new Error("Le format des données extraites est invalide");
    }
  } catch (error) {
    console.error("Error in parseStats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    };
  }
}
