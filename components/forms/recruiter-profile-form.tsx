"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { updateRecruiterProfile } from "@/actions/update-recruiter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  organization: z.string().min(2).optional(),
  position: z.string().min(2).optional(),
  region: z.string().min(2).optional(),
  experience: z.number().min(0).max(50).optional(),
})

type RecruiterFormData = {
  id: number
  organization: string | null
  position: string | null
  region: string | null
  experience: number | null
}

export function RecruiterProfileForm({ recruiter }: { recruiter: RecruiterFormData }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: recruiter.organization || "",
      position: recruiter.position || "",
      region: recruiter.region || "",
      experience: recruiter.experience || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateRecruiterProfile(recruiter.id, values)
      toast({ title: "Profil mis à jour" })
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Recruteur</CardTitle>
        <CardDescription>Mettez à jour vos informations professionnelles</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Région</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Années d&apos;expérience</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Mettre à jour</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 