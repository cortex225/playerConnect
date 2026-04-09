import "@/styles/globals.css";

// Import des polices avec Next.js 13+
import { Inter, Urbanist } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";

import { cn, constructMetadata } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import ModalProvider from "@/components/modals/providers";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";

// Configuration des polices
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontUrban = Urbanist({
  subsets: ["latin"],
  variable: "--font-urban",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = constructMetadata();

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Player Connect" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PlayerConnect" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#7c3aed" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#7c3aed" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>{children}</ModalProvider>
          <Analytics />
          <Toaster richColors closeButton />
          <PWAProvider />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
