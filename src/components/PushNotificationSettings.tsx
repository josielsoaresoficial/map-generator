import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PushNotificationSettings = () => {
  const { isSubscribed, isLoading, subscribe, unsubscribe, sendPushNotification } = usePushSubscription();

  const testPushNotification = async () => {
    console.log("[PushTest] Enviando notificação de teste...");
    const success = await sendPushNotification(
      "🔔 Teste de Notificação Push",
      "Se você viu isso com a tela bloqueada, está funcionando!",
      {
        tag: "test-notification",
        icon: "/icon-192x192.png",
        requireInteraction: true,
        data: { test: true }
      }
    );
    console.log("[PushTest] Resultado:", success);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba notificações mesmo quando o app estiver fechado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>IMPORTANTE:</strong> Para receber notificações com a tela bloqueada, você DEVE ativar as Notificações Push. 
              As notificações normais NÃO funcionam com tela bloqueada.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status: {isSubscribed ? "✅ Ativado" : "❌ Desativado"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? "Você receberá notificações push mesmo com tela bloqueada"
                : "Ative para receber notificações com Web Push (funciona com tela bloqueada)"}
            </p>
          </div>
        </div>

        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          variant={isSubscribed ? "outline" : "default"}
          className="w-full"
        >
          {isLoading ? (
            "Processando..."
          ) : isSubscribed ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Desativar Push
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Ativar Push (Web Push API)
            </>
          )}
        </Button>

        {isSubscribed && (
          <Button
            onClick={testPushNotification}
            variant="secondary"
            className="w-full"
          >
            🧪 Testar Notificação com Tela Bloqueada
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Funciona mesmo com o app fechado</p>
          <p>✅ Funciona com a tela bloqueada</p>
          <p>✅ Usa Web Push Protocol (Service Worker)</p>
          <p>✅ Notificações persistentes e interativas</p>
        </div>
      </CardContent>
    </Card>
  );
};
