import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Icons } from "../components/shared/icons";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => (
  <Html>
  <Head />
  <Preview>
    Welcome to {siteName}! Your gateway to better connections and smarter solutions.
  </Preview>
  <Tailwind>
    <Body className="bg-gray-50 font-sans text-gray-800">
      <Container className="mx-auto max-w-md px-4 py-8">
        <div className="text-center">
          <Icons.logo className="mx-auto mb-6 size-12" />
        </div>
        <Text className="mb-4 text-lg font-semibold">
          Bonjour {firstName},
        </Text>
        <Text className="mb-6 text-base leading-relaxed">
          Bienvenue sur <strong>{siteName}</strong> ! Cliquez sur le bouton ci-dessous pour{" "}
          {mailType === "login" ? "vous connecter à" : "activer"} votre compte.
        </Text>
        <Section className="my-6 text-center">
          <Button
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition hover:bg-blue-700"
            href={actionUrl}
          >
            {mailType === "login" ? "Se connecter" : "Activer mon compte"}
          </Button>
        </Section>
        <Text className="mb-4 text-sm leading-relaxed text-gray-600">
          Ce lien est valable pendant 24 heures et ne peut être utilisé qu'une seule fois.
        </Text>
        {mailType === "login" && (
          <Text className="text-sm text-gray-600">
            Si vous n’avez pas tenté de vous connecter, vous pouvez ignorer cet e-mail en toute sécurité.
          </Text>
        )}
        <Hr className="my-8 border-t-2 border-gray-300" />
        <Text className="text-center text-xs text-gray-500">
          123 Code Street, Suite 404, Devtown, CA 98765
        </Text>
      </Container>
    </Body>
  </Tailwind>
</Html>
);

export default MagicLinkEmail;
