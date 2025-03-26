import { cookies } from "next/headers";

import { infos } from "@/config/landing";
import { RoleDialogs } from "@/components/dialogs/role-dialogs";
import BentoGrid from "@/components/sections/bentogrid";
import Features from "@/components/sections/features";
import HeroLanding from "@/components/sections/hero-landing";
import InfoLanding from "@/components/sections/info-landing";
import Powered from "@/components/sections/powered";
import PreviewLanding from "@/components/sections/preview-landing";
import Testimonials from "@/components/sections/testimonials";

export default async function HomePage() {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get("selectedRole")?.value;

  return (
    <>
      <RoleDialogs roleCookie={roleCookie} />

      <HeroLanding />
      <PreviewLanding />
      <Powered />
      <BentoGrid />
      <InfoLanding data={infos[0]} reverse={true} />
      <InfoLanding data={infos[1]} />
      <Features />
      <Testimonials />
    </>
  );
}
