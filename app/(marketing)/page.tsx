
import { NextApiRequest } from 'next';
import { cookies } from 'next/headers';
import { auth } from "@/auth";



import { infos } from "@/config/landing";
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

            <HeroLanding/>
            <PreviewLanding/>
            <Powered/>
            <BentoGrid/>
            <InfoLanding data={infos[0]} reverse={true}/>
            <InfoLanding data={infos[1]}/>
            <Features/>
            <Testimonials/>
            {/*<MessagingInterface/>*/}


        </>
    );
}