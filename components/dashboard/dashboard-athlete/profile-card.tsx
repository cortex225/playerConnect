"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePositionsForm } from "@/components/forms/update-positions-form";
import { Position } from "@prisma/client";

interface ProfileCardProps {
  user: {
    name: string | null;
    image: string | null;
  };
  athlete: {
    id: number;
    sportId: string;
    sport: {
      name: string;
    } | null;
    gender: string;
    age: number;
    city: string;
    height: number;
    weight: number;
  };
  positions: Position[];
}

export function ProfileCard({ user, athlete, positions }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et vos statistiques
            </CardDescription>
          </div>
          <Avatar>
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Informations Personnelles</h3>
              <div className="grid gap-2">
                <div>
                  <span className="font-medium">Sport:</span> {athlete.sport?.name}
                </div>
                <div>
                  <span className="font-medium">Positions:</span>
                  <div className="mt-2">
                    <UpdatePositionsForm 
                      athleteId={athlete.id}
                      sportId={athlete.sportId}
                      currentPositions={positions.map(p => p.id)}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium">Genre:</span> {athlete.gender}
                </div>
                <div>
                  <span className="font-medium">Âge:</span> {athlete.age} ans
                </div>
                <div>
                  <span className="font-medium">Ville:</span> {athlete.city}
                </div>
                <div>
                  <span className="font-medium">Taille:</span> {athlete.height} cm
                </div>
                <div>
                  <span className="font-medium">Poids:</span> {athlete.weight} kg
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
