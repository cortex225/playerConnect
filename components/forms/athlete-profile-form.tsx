"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Gender, DominantHand, DominantFoot, ProgramType } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { updateAthleteProfile } from "@/actions/update-athlete"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  gender: z.nativeEnum(Gender),
  age: z.number().min(5).max(100),
  city: z.string().min(2),
  height: z.number().min(100).max(250),
  weight: z.number().min(20).max(200),
  dominantHand: z.nativeEnum(DominantHand),
  dominantFoot: z.nativeEnum(DominantFoot),
  programType: z.nativeEnum(ProgramType),
})

type AthleteFormData = {
  id: number
  gender: Gender | null
  age: number | null
  city: string | null
  height: number | null
  weight: number | null
  dominantHand: DominantHand | null
  dominantFoot: DominantFoot | null
  programType: ProgramType | null
  sportId: string | null
  positions: string[]
}

export function AthleteProfileForm({ athlete }: { athlete: AthleteFormData }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: athlete.gender || undefined,
      age: athlete.age || undefined,
      city: athlete.city || "",
      height: athlete.height || undefined,
      weight: athlete.weight || undefined,
      dominantHand: athlete.dominantHand || undefined,
      dominantFoot: athlete.dominantFoot || undefined,
      programType: athlete.programType || undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateAthleteProfile(athlete.id, values)
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Athlète</CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles d&apos;athlète.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Ajoutez ici tous les champs du formulaire */}
            <Button type="submit">Mettre à jour le profil</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 