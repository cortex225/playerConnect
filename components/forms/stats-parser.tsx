"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import type { StatItem } from "@/types/stats";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { parseStats } from "@/app/actions/stats";

interface StatsParserProps {
  onStatsExtracted: (stats: StatItem[]) => void;
}

export function StatsParser({ onStatsExtracted }: StatsParserProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);

      try {
        const result = await parseStats(formData);
        if (!result.success || !result.data) {
          throw new Error(result.error || "Erreur lors de l'analyse");
        }

        onStatsExtracted(result.data);
        toast.success("Fichier analysé avec succès");
      } catch (error) {
        console.error("Error in onDrop:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'analyse du fichier",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleFileUpload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromPdf(buffer);

    // Envoyer le texte à OpenAI
    // const result = await openai.chat.completions.create({
    //   messages: [
    //     { role: "system", content: "Extrait les statistiques..." },
    //     { role: "user", content: text }
    //   ]
    // });
  };

  return (
    <div
      {...getRootProps()}
      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary"
    >
      <input {...getInputProps()} />
      <div className="text-center">
        {isLoading ? (
          <Icons.spinner className="mx-auto size-8 animate-spin" />
        ) : (
          <>
            {isDragActive ? (
              <p>Déposez le fichier ici...</p>
            ) : (
              <Button variant="outline">Sélectionner un fichier</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
