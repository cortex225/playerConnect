
import { NextApiRequest } from 'next';
import { cookies } from 'next/headers';
import { auth } from "@/auth";



import { infos } from "@/config/landing";
import { parseCookies } from "@/lib/parseCookies";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AthleteForm } from "@/components/forms/athlete-form";
import { AthleteDialogCreate } from "@/components/modals/athlete/create";
import { RecruiterDialogCreate } from "@/components/modals/recruiter/create";
import BentoGrid from "@/components/sections/bentogrid";
import Features from "@/components/sections/features";
import HeroLanding from "@/components/sections/hero-landing";
import InfoLanding from "@/components/sections/info-landing";
import Powered from "@/components/sections/powered";
import PreviewLanding from "@/components/sections/preview-landing";
import Testimonials from "@/components/sections/testimonials";





export default async function IndexPage(req: NextApiRequest) {

  const session = await auth();
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user_role')?.value;




    return (

        <>
         {session?.user?.role === "USER" && roleCookie === "ATHLETE" && (
           <AthleteDialogCreate />
         )}
         {session?.user?.role === "USER" && roleCookie === "RECRUITER" && (
           <RecruiterDialogCreate />
         )}

         <div className="flex flex-col items-center justify-center gap-10 py-20">
            je suis un {session?.user?.role}
         </div>
            <HeroLanding/>
            <PreviewLanding/>
            <Powered/>
            <BentoGrid/>
            <InfoLanding data={infos[0]} reverse={true}/>
            <InfoLanding data={infos[1]}/>
            <Features/>
            <Testimonials/>
        </>
    );
}