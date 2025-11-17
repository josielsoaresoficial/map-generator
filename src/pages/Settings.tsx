import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Volume2, Bell, Clock, Smartphone } from "lucide-react";
import { useVoiceSettings } from "@/hooks/useVoiceSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useAlarmSettings } from "@/hooks/useAlarmSettings";
import { useVibrationSettings } from "@/hooks/useVibrationSettings";
import { useToast } from "@/hooks/use-toast";
import { PushNotificationSettings } from "@/components/PushNotificationSettings";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    filteredVoices, 
    selectedVoiceURI, 
    preferredGender,
    saveVoiceSettings, 
    savePreferredGender,
    getSelectedVoice,
    getMaleVoices,
    getFemaleVoices,
    categorizeVoiceGender
  } = useVoiceSettings();
  const { permission, requestPermission } = useNotifications();
  const { settings: alarmSettings, saveAlarmSettings } = useAlarmSettings();
  const { settings: vibrationSettings, saveVibrationSettings } = useVibrationSettings();

  const handleVoiceChange = (voiceURI: string) => {
    saveVoiceSettings(voiceURI);
    toast({
      title: "Voz alterada",
      description: "A nova voz será usada nos próximos alertas",
    });
  };

  const handleGenderChange = (gender: "male" | "female" | "all") => {
    savePreferredGender(gender);
    const genderText = gender === "male" ? "masculinas" : gender === "female" ? "femininas" : "todas";
    toast({
      title: "Tipo de voz alterado",
      description: `Mostrando vozes ${genderText}`,
    });
  };

  const handleAlarmDurationChange = (duration: string) => {
    saveAlarmSettings({ repeatDuration: parseInt(duration) });
    const durationText = duration === "0" ? "desligado" : 
                         duration === "30" ? "30 segundos" :
                         duration === "60" ? "1 minuto" :
                         duration === "120" ? "2 minutos" :
                         duration === "300" ? "5 minutos" : `${duration} segundos`;
    toast({
      title: "Duração do alarme alterada",
      description: `O alarme repetirá por ${durationText}`,
    });
  };

  const handleVibrationChange = (pattern: "soft" | "normal" | "intense") => {
    saveVibrationSettings({ pattern });
    const patternText = pattern === "soft" ? "suave" :
                        pattern === "normal" ? "normal" :
                        "intenso";
    toast({
      title: "Padrão de vibração alterado",
      description: `Padrão configurado para: ${patternText}`,
    });
  };

  const handleRequestNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Permissão concedida",
        description: "Você receberá notificações quando o app estiver fechado",
      });
    } else {
      // Check if permanently denied
      if (permission === "denied") {
        toast({
          title: "Permissão bloqueada",
          description: "Você negou a permissão anteriormente. Para ativar, vá nas configurações do navegador e permita notificações para este site.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Você não receberá notificações quando o app estiver fechado",
          variant: "destructive",
        });
      }
    }
  };

  const testVoice = () => {
    const voice = getSelectedVoice();
    const utterance = new SpeechSynthesisUtterance("Está na hora de: Teste de voz");
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-safe">
      <div className="container max-w-2xl mx-auto p-4 md:p-8 safe-top">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
        </div>

        <div className="space-y-6">
          {/* Notification Permission */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Notificações Push</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permita notificações para receber alertas quando o app estiver fechado
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      Status: {permission === "granted" ? "✓ Ativado" : permission === "denied" ? "✗ Negado" : "⚠ Pendente"}
                    </span>
                    {permission !== "granted" && (
                      <Button onClick={handleRequestNotifications} size="sm">
                        Solicitar Permissão
                      </Button>
                    )}
                  </div>
                  
                  {permission === "denied" && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium mb-2">
                        Permissão bloqueada pelo navegador
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Para reativar as notificações, você precisa permitir manualmente nas configurações do navegador:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li><strong>Chrome/Edge:</strong> Clique no ícone de cadeado/informações ao lado da URL → Notificações → Permitir</li>
                        <li><strong>Firefox:</strong> Clique no ícone de informações → Permissões → Notificações → Permitir</li>
                        <li><strong>Safari:</strong> Safari → Preferências → Sites → Notificações</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Push Notifications Settings */}
          <PushNotificationSettings />

          {/* Voice Selection */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Voz do Assistente</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha a voz que será usada para anunciar suas tarefas quando o app estiver aberto
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender-select">Tipo de Voz</Label>
                    <Select value={preferredGender} onValueChange={handleGenderChange}>
                      <SelectTrigger id="gender-select" className="w-full">
                        <SelectValue placeholder="Escolha o tipo de voz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas as Vozes ({getMaleVoices().length + getFemaleVoices().length})
                        </SelectItem>
                        <SelectItem value="male">
                          🙋‍♂️ Voz Masculina ({getMaleVoices().length} disponíveis)
                        </SelectItem>
                        <SelectItem value="female">
                          🙋‍♀️ Voz Feminina ({getFemaleVoices().length} disponíveis)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voice-select">Voz Específica</Label>
                    <Select value={selectedVoiceURI || ""} onValueChange={handleVoiceChange}>
                      <SelectTrigger id="voice-select" className="w-full">
                        <SelectValue placeholder="Selecione uma voz" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
                        {filteredVoices.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhuma voz disponível
                          </SelectItem>
                        ) : (
                          filteredVoices.map((voice) => {
                            const gender = categorizeVoiceGender(voice);
                            const genderEmoji = gender === "male" ? "♂️" : "♀️";
                            return (
                              <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                {genderEmoji} {voice.name} ({voice.lang})
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={testVoice} variant="outline" size="sm" disabled={!selectedVoiceURI}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Testar Voz
                </Button>
              </div>
            </div>
          </Card>

          {/* Alarm Repeat Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Repetição do Alarme</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure por quanto tempo o alarme deve repetir quando uma tarefa for acionada
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alarm-duration">Duração da Repetição</Label>
                  <Select 
                    value={alarmSettings.repeatDuration.toString()} 
                    onValueChange={handleAlarmDurationChange}
                  >
                    <SelectTrigger id="alarm-duration" className="w-full">
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="0">Desligado (toca 1 vez)</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">1 minuto</SelectItem>
                      <SelectItem value="120">2 minutos</SelectItem>
                      <SelectItem value="300">5 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {alarmSettings.repeatDuration > 0 
                      ? `O alarme tocará a cada ${alarmSettings.repeatInterval} segundos durante o período configurado`
                      : "O alarme tocará apenas uma vez"
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Vibration Pattern Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Padrão de Vibração</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize a intensidade da vibração das notificações
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vibration-pattern">Intensidade</Label>
                  <Select 
                    value={vibrationSettings.pattern} 
                    onValueChange={handleVibrationChange}
                  >
                    <SelectTrigger id="vibration-pattern" className="w-full">
                      <SelectValue placeholder="Selecione a intensidade" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="soft">Suave</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="intense">Intenso</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {vibrationSettings.pattern === "soft" && "Vibração leve e curta"}
                    {vibrationSettings.pattern === "normal" && "Vibração padrão balanceada"}
                    {vibrationSettings.pattern === "intense" && "Vibração forte e prolongada"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-primary/5">
            <h3 className="font-semibold mb-2">Como funcionam os alertas?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>App aberto:</strong> Som de alerta + anúncio por voz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>App fechado:</strong> Notificação push com som do sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>O app verifica a hora a cada 10 segundos</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
