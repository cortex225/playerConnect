"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { mediaFormSchema, type MediaFormValues } from "@/lib/validations/media";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/shared/icons";

interface MediaFormProps {
  onSuccess?: () => void;
}

export function MediaForm({ onSuccess }: MediaFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov"],
    },
    maxFiles: 1,
  });

  async function onSubmit(data: MediaFormValues) {
    setIsLoading(true);

    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("file", file);

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      toast.success("Média ajouté avec succès");
      router.refresh();
      form.reset();
      setFile(null);
      onSuccess?.();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la vidéo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea placeholder="Description de la vidéo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          {...getRootProps()}
          className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center hover:border-primary"
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-2">
              <Icons.check className="mx-auto size-6 text-green-500" />
              <p>{file.name}</p>
            </div>
          ) : isDragActive ? (
            <p>Déposez le fichier ici...</p>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="mx-auto size-6" />
              <p>
                Glissez et déposez un fichier vidéo, ou cliquez pour
                sélectionner
              </p>
              <p className="text-sm text-muted-foreground">
                MP4, AVI ou MOV (max. 100MB)
              </p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Ajouter le média
        </Button>
      </form>
    </Form>
  );
}
