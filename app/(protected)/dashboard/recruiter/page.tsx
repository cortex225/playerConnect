import {getCurrentUser} from "@/lib/session";
import {constructMetadata} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {DashboardHeader} from "@/components/dashboard/header";
import {DashboardShell} from "@/components/dashboard/shell";
import {EmptyPlaceholder} from "@/components/shared/empty-placeholder";
import {redirect} from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import {  Bell, MessageCircle, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";


export const metadata = constructMetadata({
    title: "Accueil – Player Connect",
    description: "Create and manage content.",
});

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "RECRUITER") redirect("/login");

    // const [searchTerm, setSearchTerm] = useState("")
    // const [sportFilter, setSportFilter] = useState("All")
    //
    // const filteredAthletes = athletes.filter(athlete =>
    //     athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    //     (sportFilter === "All" || athlete.sport === sportFilter)
    // );
    return (
        <DashboardShell>
            {/*<DashboardHeader*/}
            {/*    heading="Dashboard"*/}
            {/*    text={`Current Role : ${user?.role} — Change your role in settings.`}*/}
            {/*>*/}
            {/*</DashboardHeader>*/}
            <header className="bg-background p-4 rounded-2xl">
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                    {/* Section gauche : Avatar et infos */}
                    <div className="flex justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Thompson"/>
                                <AvatarFallback>ST</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold dark:text-white truncate">Sarah Thompson</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    NCAA Division I Scout
                                </p>
                            </div>
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Quick Stats */}
                    {/*{recruiterStats.map((stat, index) => (*/}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {/*{stat.name}*/}
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold"></div>
                            </CardContent>
                        </Card>
                    {/*))}*/}
                </div>
            </div>
        </DashboardShell>
    );
}
