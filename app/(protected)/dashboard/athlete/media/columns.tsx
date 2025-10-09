"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreHorizontal, Trash } from "lucide-react";

import { deleteMedia } from "@/actions/delete-media";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export type Media = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Media>[] = [
  {
    accessorKey: "title",
    header: "Titre",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "PPP", { locale: fr });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const media = row.original;

      const handleDelete = async () => {
        try {
          const result = await deleteMedia(media.id);
          if (result.error) {
            toast({
              title: "Erreur",
              description: result.error,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Succès",
              description: "Le média a été supprimé avec succès",
            });
          }
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la suppression",
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(media.url)}
            >
              Copier le lien
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash className="mr-2 size-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
