import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Bell, BellOff } from "lucide-react";

export const PushNotificationSettings = () => {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = usePushSubscription();

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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status: {isSubscribed ? "Ativado" : "Desativado"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? "Você receberá notificações push para tarefas e pomodoro"
                : "Ative para receber notificações mesmo com o app fechado"}
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
              Ativar Push
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Funciona mesmo com o app fechado</p>
          <p>• Funciona com a tela bloqueada</p>
          <p>• Requer permissão de notificações</p>
          <p>• Notificações persistentes e interativas</p>
        </div>
      </CardContent>
    </Card>
  );
};
