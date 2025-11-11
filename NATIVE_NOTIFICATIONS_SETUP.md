# Configuração de Notificações Nativas

## Passo 1: Exportar e Configurar Projeto

1. **Exporte o projeto para o GitHub** usando o botão "Export to GitHub"
2. Clone o repositório em sua máquina local
3. Execute: `npm install`
4. Execute: `npm run build`

## Passo 2: Adicionar Plataformas Nativas

```bash
npx cap add android
npx cap add ios
```

## Passo 3: Configurar Android

### Editar `android/app/src/main/AndroidManifest.xml`

Adicione as seguintes permissões dentro da tag `<manifest>`:

```xml
<!-- Permissões para notificações com tela bloqueada -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
```

Dentro da tag `<application>`, adicione:

```xml
<receiver 
    android:name="com.capacitorjs.plugins.localnotifications.LocalNotificationReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

### Editar `android/app/src/main/res/values/strings.xml`

Adicione:

```xml
<string name="local_notification_channel_name">Lembretes de Tarefas</string>
<string name="local_notification_channel_description">Notificações para suas tarefas e Pomodoro</string>
```

### Criar `android/app/src/main/res/raw/beep.wav`

Adicione um arquivo de som `beep.wav` na pasta `android/app/src/main/res/raw/` para o som personalizado das notificações.

## Passo 4: Configurar iOS

### Editar `ios/App/App/Info.plist`

Adicione dentro do `<dict>`:

```xml
<!-- Permissões para notificações em background -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>fetch</string>
</array>

<!-- Descrição das permissões de notificação -->
<key>NSUserNotificationUsageDescription</key>
<string>Precisamos enviar notificações para lembrá-lo de suas tarefas e intervalos do Pomodoro</string>
```

### Habilitar Capacidades no Xcode (somente para iOS)

1. Abra o projeto no Xcode: `npx cap open ios`
2. Selecione o target do app
3. Vá para a aba "Signing & Capabilities"
4. Clique em "+ Capability"
5. Adicione "Push Notifications"
6. Adicione "Background Modes" e marque:
   - Remote notifications
   - Background fetch

## Passo 5: Sincronizar e Executar

```bash
# Sincronizar mudanças
npx cap sync

# Executar no Android
npx cap run android

# Executar no iOS (requer Mac com Xcode)
npx cap run ios
```

## Passo 6: Testar Notificações

1. Abra o app no dispositivo
2. Permita as notificações quando solicitado
3. Bloqueie a tela do dispositivo
4. Crie uma tarefa com alarme
5. A notificação deve aparecer mesmo com a tela bloqueada

## Notas Importantes

### Android
- **Importance 5** garante que as notificações apareçam como heads-up mesmo com tela bloqueada
- `USE_FULL_SCREEN_INTENT` permite notificações de tela cheia
- `WAKE_LOCK` mantém o dispositivo acordado durante a notificação
- `SCHEDULE_EXACT_ALARM` garante que alarmes disparem no horário exato (Android 12+)

### iOS
- As notificações funcionam automaticamente com tela bloqueada quando as permissões são concedidas
- Os background modes garantem que o app possa processar notificações mesmo em background

## Solução de Problemas

### Android: Notificações não aparecem com tela bloqueada
1. Verifique se todas as permissões foram adicionadas
2. Em dispositivos Android 12+, certifique-se de que o usuário concedeu permissão para alarmes exatos nas configurações do sistema
3. Verifique as configurações de economia de bateria do dispositivo

### iOS: Notificações não aparecem
1. Certifique-se de que as capacidades foram habilitadas no Xcode
2. Verifique se o certificado de push está configurado no Apple Developer Portal
3. Teste em um dispositivo físico (notificações podem não funcionar no simulador)

## Recursos Adicionais

- [Documentação Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [Guia de Notificações Android](https://developer.android.com/develop/ui/views/notifications)
- [Guia de Notificações iOS](https://developer.apple.com/documentation/usernotifications)
