import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share, MoreVertical, Menu, Check, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    setIsInstalled(isStandalone);

    if (isIOS) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error("Error during installation:", error);
      }
    }
  };

  const getPlatformInstructions = () => {
    switch (platform) {
      case "ios":
        return (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share className="h-5 w-5 text-primary" />
              Instruções para iOS (Safari)
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Abra este site no <strong>Safari</strong></li>
              <li>Toque no botão <Share className="inline h-4 w-4 mx-1" /> (Compartilhar) na barra inferior</li>
              <li>Role para baixo até encontrar <strong>"Adicionar à Tela de Início"</strong></li>
              <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
              <li>Pronto! O ícone do app aparecerá na sua tela inicial</li>
            </ol>
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <Share className="h-6 w-6 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Dica:</strong> O botão de compartilhar fica na barra inferior do Safari (ícone de uma caixa com seta para cima)
              </p>
            </div>
          </Card>
        );
      case "android":
        return (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MoreVertical className="h-5 w-5 text-primary" />
              Instruções para Android (Chrome)
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Abra este site no <strong>Chrome</strong></li>
              <li>Toque no menu <MoreVertical className="inline h-4 w-4 mx-1" /> (três pontos) no canto superior direito</li>
              <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong></li>
              <li>Confirme tocando em <strong>"Adicionar"</strong> ou <strong>"Instalar"</strong></li>
              <li>Pronto! O app será instalado no seu dispositivo</li>
            </ol>
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <MoreVertical className="h-6 w-6 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Dica:</strong> O menu fica no canto superior direito do Chrome (três pontos verticais)
              </p>
            </div>
          </Card>
        );
      default:
        return (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Menu className="h-5 w-5 text-primary" />
              Instruções para Desktop
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Abra este site no seu navegador favorito</li>
              <li>Procure pelo ícone de instalação <Download className="inline h-4 w-4 mx-1" /> na barra de endereço</li>
              <li>Clique em <strong>"Instalar"</strong> ou <strong>"Adicionar"</strong></li>
              <li>Pronto! O app será instalado no seu computador</li>
            </ol>
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <Download className="h-6 w-6 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Dica:</strong> A maioria dos navegadores mostra um ícone de instalação na barra de endereço quando o site pode ser instalado
              </p>
            </div>
          </Card>
        );
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">App Instalado!</h1>
          <p className="text-muted-foreground">
            O Assistente de Rotina já está instalado no seu dispositivo. Você pode fechá-lo e abrir através do ícone na sua tela inicial.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Ir para o App
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-safe">
      <div className="container max-w-3xl mx-auto p-4 md:p-8 safe-top">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Instale o App
            </h1>
            <p className="text-muted-foreground">
              Tenha acesso rápido ao seu assistente de rotina
            </p>
          </div>
        </div>

        {/* Benefits */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-card to-card/50 shadow-xl border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Por que instalar?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
              <span><strong>Acesso instantâneo</strong> - Abra direto da tela inicial, sem precisar buscar no navegador</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
              <span><strong>Funciona offline</strong> - Use mesmo sem internet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
              <span><strong>Experiência nativa</strong> - Parece e funciona como um app de verdade</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
              <span><strong>Sem lojas de app</strong> - Não precisa baixar de loja nenhuma</span>
            </li>
          </ul>
        </Card>

        {/* Install Button */}
        {deferredPrompt && (
          <Card className="p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Instalação Rápida</h2>
            <p className="text-muted-foreground mb-6">
              Seu navegador suporta instalação automática! Clique no botão abaixo.
            </p>
            <Button
              onClick={handleInstallClick}
              size="lg"
              className="w-full gap-2 shadow-button hover:shadow-lg transition-all"
            >
              <Download className="h-5 w-5" />
              Instalar Agora
            </Button>
          </Card>
        )}

        {/* Manual Instructions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Instruções Manuais</h2>
          {getPlatformInstructions()}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Voltar para o App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;