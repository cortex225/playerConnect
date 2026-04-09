"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Detect standalone mode (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after a short delay (don't interrupt immediately)
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // On iOS, show banner if not standalone and not dismissed
    if (ios && !standalone) {
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  // Don't show anything if already installed
  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] mx-4 animate-in slide-in-from-bottom-4 md:bottom-4 md:left-auto md:right-4 md:mx-0 md:max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur-lg">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
          <Download className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Installe Player Connect</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground">
              Appuie sur{" "}
              <span className="inline-flex items-center rounded bg-muted px-1 text-[10px] font-medium">
                Partager ↑
              </span>{" "}
              puis "Sur l&apos;écran d&apos;accueil"
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Accès rapide depuis ton écran d&apos;accueil
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isIOS && deferredPrompt && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 px-3 text-xs text-white"
            >
              Installer
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
