import {getCurrentUser} from "@/lib/session";
import {constructMetadata} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {DashboardShell} from "@/components/dashboard/shell";
import {redirect} from "next/navigation";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Input} from "@/components/ui/input";
import {Bell, MessageCircle, PieChart, Search} from 'lucide-react';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Card, CardTitle, CardHeader, CardContent} from "@/components/ui/card";
import {RecruitmentProgress} from "@/components/dashboard/dashboard-recruiter/recruitment-progress";
import UpcomingMatches from "@/components/dashboard/dashboard-recruiter/upcoming-matches";
import {Calendar} from "@/components/ui/calendar";
import {TopAthletes} from "@/components/dashboard/dashboard-recruiter/top-athletes";
import {LittleCalendar} from "@/components/dashboard/dashboard-recruiter/little-calendar";
import {QuickStats} from "@/components/dashboard/dashboard-recruiter/quick-stats";
import ConnectedRecruiter from "@/components/dashboard/dashboard-recruiter/connected-recruiter";


export const metadata = constructMetadata({
    title: "Accueil – Player Connect",
    description: "Create and manage content.",
});

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "RECRUITER") redirect("/login");




    return (
        <DashboardShell>

            <header className="bg-background p-4 rounded-2xl">
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                    {/* Section gauche : Avatar et infos */}
                    <div className="flex justify-between">
                        <ConnectedRecruiter/>
                        {/* Icônes de notification et messagerie */}
                        <div className="flex justify-end items-center space-x-2">
                            {/* Notification */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Bell className="h-5 w-5"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>New athlete profile added</DropdownMenuItem>
                                    <DropdownMenuItem>Upcoming match reminder</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Messages */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MessageCircle className="h-5 w-5"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Message from John Doe</DropdownMenuItem>
                                    <DropdownMenuItem>Chat with coaching staff</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>


                    {/* Section droite : Recherche et actions */}
                    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                        <form className="relative w-full md:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"/>
                            <Input
                                type="search"
                                placeholder="Search athletes..."
                                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                            />
                        </form>


                    </div>
                </div>
            </header>
            <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Quick Stats */}
                    <QuickStats/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Matches Carousel */}
                    <UpcomingMatches/>

                    {/* Recruitment Progress */}
                    <RecruitmentProgress/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Athletes */}

                    <TopAthletes/>

                    {/* Calendar */}
                    <LittleCalendar/>

                </div>

            </div>
        </DashboardShell>
    );
}