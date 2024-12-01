import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Eye, Star } from "lucide-react";
import { Athlete } from "@/types";

type Props = {
    athlete: Athlete;
    setSelectedAthlete: (athlete: Athlete | null) => void;
    selectedAthlete: Athlete | null;
};

export default function AthleteProfileDialog({
                                                 athlete,
                                                 setSelectedAthlete,
                                                 selectedAthlete,
                                             }: Props) {
    // Générer les données de performances pour le LineChart
    const performanceData =
        athlete.performances?.map((performance) => ({
            date: performance.date
                ? new Date(performance.date).toLocaleDateString()
                : "Date inconnue",
            score: performance.score || 0,
        })) || [];

    // Générer les données pour le RadarChart en agrégeant les KPI par sujet
    const kpiData =
        athlete.performances?.flatMap((performance) =>
            performance.KPI?.map((kpi) => ({
                subject: kpi.name || "Inconnu",
                value: kpi.value || 0,
            })) || []
        ) || [];

    // Agréger les KPI par sujet pour éviter les doublons
    const aggregatedKpiData = Object.values(
        kpiData.reduce((acc, { subject, value }) => {
            if (!acc[subject]) {
                acc[subject] = { subject, value };
            } else {
                acc[subject].value += value;
            }
            return acc;
        }, {} as Record<string, { subject: string; value: number }>)
    );


    // Fonction pour afficher les étoiles
    const renderStars = (rating: number | undefined) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`size-4 ${
                    star <= (rating || 0) ? "fill-current text-yellow-400" : "text-gray-300"
                }`}
            />
        ));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedAthlete(athlete)}>
                    <Eye className="mr-1 size-4"/>
                    Voir le profil
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Profil de l'athlète</DialogTitle>
                    <DialogDescription>
                        Informations détaillées sur {selectedAthlete?.user?.name || "cet athlète"}.
                    </DialogDescription>
                </DialogHeader>
                {selectedAthlete && (
                    <div className="grid gap-4 py-4">
                        {/* Profil principal de l'athlète */}
                        <div className="flex items-center gap-4">
                            <Avatar className="size-20">
                                {selectedAthlete.user?.image ? (
                                    <AvatarImage
                                        src={selectedAthlete.user.image}
                                        alt={selectedAthlete.user.name || "Athlète"}
                                    />
                                ) : (
                                    <AvatarFallback>
                                        {selectedAthlete.user?.name
                                            ? selectedAthlete.user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                            : "N/A"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {selectedAthlete.user?.name || "Athlète inconnu"}
                                </h2>
                                <p className="text-gray-500">
                                    Sport : {selectedAthlete.sport?.name || "Sport inconnu"}, Âge :{" "}
                                    {selectedAthlete.age || "N/A"}
                                </p>
                                <div className="mt-1 flex items-center">
                                    {renderStars(selectedAthlete.rating)}
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({selectedAthlete.rating || "Pas de note"})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Résumé des performances */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Résumé des performances</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Indicateurs Clés de Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {aggregatedKpiData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <RadarChart
                                                cx="50%"
                                                cy="50%"
                                                outerRadius="100%"
                                                data={aggregatedKpiData}
                                            >
                                                <PolarGrid/>
                                                <PolarAngleAxis dataKey="subject"/>
                                                <PolarRadiusAxis/>
                                                <Radar
                                                    name="Performance"
                                                    dataKey="value"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.7}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p>Aucune donnée de KPI disponible pour cet athlète.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions en bas */}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline">Contacter l'athlète</Button>
                            <Button>Ajouter à la liste de suivi</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}