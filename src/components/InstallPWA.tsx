import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Menu, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");

  useEffect(() => {
    console.log("[PWA Install] Component mounted");

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    console.log("[PWA Install] User Agent:", userAgent);
    console.log("[PWA Install] Is iOS:", isIOS);
    console.log("[PWA Install] Is Android:", isAndroid);
    console.log("[PWA Install] Is Standalone:", isStandalone);

    if (isIOS) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Don't show if already installed
    if (isStandalone) {
      console.log("[PWA Install] App is already installed (standalone mode)");
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA Install] beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show dialog after 2 seconds (always show for testing)
    const timer = setTimeout(() => {
      console.log("[PWA Install] Showing install dialog after 2 seconds");
      setShowInstallDialog(true);
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log("[PWA Install] Install button clicked");
    console.log("[PWA Install] Deferred prompt available:", !!deferredPrompt);

    if (deferredPrompt) {
      console.log("[PWA Install] Attempting automatic installation");
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log("[PWA Install] User choice:", choiceResult.outcome);

        if (choiceResult.outcome === "accepted") {
          console.log("[PWA Install] User accepted the install prompt");
          setShowInstallDialog(false);
        } else {
          console.log("[PWA Install] User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error("[PWA Install] Error during installation:", error);
        setShowManualInstructions(true);
      }
    } else {
      console.log("[PWA Install] No deferred prompt, showing manual instructions");
      setShowManualInstructions(true);
    }
  };

  const handleClose = () => {
    console.log("[PWA Install] Dialog closed by user");
    setShowInstallDialog(false);
    setShowManualInstructions(false);
  };

  const getManualInstructions = () => {
    switch (platform) {
      case "ios":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No Safari do iOS, siga estes passos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Toque no botão <Share className="inline h-4 w-4 mx-1" /> (Compartilhar) na barra inferior</li>
              <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
              <li>Toque em "Adicionar" no canto superior direito</li>
            </ol>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Share className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Procure por este ícone na barra inferior do Safari
              </p>
            </div>
          </div>
        );
      case "android":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No Chrome do Android, siga estes passos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Toque no menu <MoreVertical className="inline h-4 w-4 mx-1" /> (três pontos) no canto superior direito</li>
              <li>Selecione "Adicionar à tela inicial" ou "Instalar aplicativo"</li>
              <li>Confirme tocando em "Adicionar" ou "Instalar"</li>
            </ol>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <MoreVertical className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Procure por este ícone no canto superior direito
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No seu navegador, siga estes passos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Clique no menu <Menu className="inline h-4 w-4 mx-1" /> do navegador</li>
              <li>Procure por "Instalar", "Adicionar à área de trabalho" ou similar</li>
              <li>Confirme a instalação</li>
            </ol>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Procure pela opção de instalação no menu do navegador
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <Download className="h-10 w-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Instale o App!
          </DialogTitle>
          <DialogDescription className="text-center">
            Tenha acesso rápido ao seu assistente de rotina diretamente da tela inicial do seu dispositivo
          </DialogDescription>
        </DialogHeader>

        {!showManualInstructions ? (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Acesso instantâneo da tela inicial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Funciona offline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Experiência como app nativo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Sem ocupar espaço na loja de apps</span>
                </li>
              </ul>
            </Card>

            <Button
              onClick={handleInstallClick}
              className="w-full gap-2 shadow-button hover:shadow-lg transition-all"
              size="lg"
            >
              <Download className="h-5 w-5" />
              Instalar Agora
            </Button>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              Agora não
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {getManualInstructions()}
            <Button
              variant="outline"
              onClick={() => setShowManualInstructions(false)}
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWA;