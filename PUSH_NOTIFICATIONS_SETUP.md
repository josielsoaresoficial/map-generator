# Configuração de Notificações Push

Este app agora suporta notificações push do navegador que funcionam mesmo quando o app está fechado ou a tela bloqueada.

## Como Funciona

### 1. Service Worker
O service worker (`public/sw.js`) gerencia:
- Recebimento de notificações push
- Exibição de notificações persistentes
- Handlers de clique em notificações

### 2. Backend (Edge Function)
A edge function `notify` (`supabase/functions/notify/index.ts`):
- Envia payloads push para os usuários inscritos
- Gerencia subscrições no banco de dados
- Remove subscrições inválidas automaticamente

### 3. Banco de Dados
Tabela `push_subscriptions`:
- Armazena subscrições de push por usuário
- Contém endpoint, chaves p256dh e auth
- RLS policies garantem que usuários só vejam suas próprias subscrições

### 4. Frontend
Hook `usePushSubscription`:
- Gerencia inscrição/desinscrição de push
- Envia notificações push via edge function
- Verifica status de subscrição

## IMPORTANTE: VAPID Keys

⚠️ **CONFIGURAÇÃO NECESSÁRIA**

Para que as notificações push funcionem, você precisa:

1. Gerar chaves VAPID (Voluntary Application Server Identification):
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Adicionar a chave pública no arquivo `src/hooks/usePushSubscription.ts`:
   ```typescript
   const VAPID_PUBLIC_KEY = "SUA_CHAVE_PUBLICA_AQUI";
   ```

3. Adicionar a chave privada como secret no Supabase:
   - Nome: `VAPID_PRIVATE_KEY`
   - Valor: Sua chave privada VAPID

## Eventos que Acionam Push

As notificações push são enviadas nos seguintes eventos:

### 1. Tarefas
- ⏰ **Hora da Tarefa**: Quando chega a hora de uma tarefa
- 🔔 **Lembrete**: X minutos antes da tarefa (se configurado)

### 2. Pomodoro
- 🎉 **Sessão Completa**: Quando uma sessão de trabalho termina
- ⏸️ **Pausa Terminada**: Quando uma pausa termina

## Como Usar

### Para Usuários

1. Acesse as Configurações
2. Role até "Notificações Push"
3. Clique em "Ativar Push"
4. Aceite a permissão do navegador
5. Pronto! Você receberá notificações push

### Para Desenvolvedores

#### Enviar uma notificação push:

```typescript
import { usePushSubscription } from "@/hooks/usePushSubscription";

const { sendPushNotification } = usePushSubscription();

await sendPushNotification(
  "Título da Notificação",
  "Corpo da mensagem",
  {
    tag: "unique-id",
    icon: "/icon-192x192.png",
    data: { custom: "data" }
  }
);
```

#### Verificar status de subscrição:

```typescript
const { isSubscribed, isLoading } = usePushSubscription();
```

## Compatibilidade

### Web (PWA)
✅ Chrome, Edge, Firefox, Opera
❌ Safari (suporte limitado)

### Mobile (Capacitor)
✅ Android (via Local Notifications)
✅ iOS (via Local Notifications)

## Segurança

- Todas as subscrições são vinculadas ao usuário autenticado
- RLS policies garantem que usuários só acessem suas próprias subscrições
- Edge function valida JWT antes de enviar notificações
- Subscrições inválidas são removidas automaticamente

## Troubleshooting

### Notificações não aparecem
1. Verifique se a permissão foi concedida
2. Verifique se as VAPID keys estão configuradas
3. Verifique o console do navegador para erros
4. Teste com o service worker atualizado

### Subscrição falha
1. Verifique se o service worker está registrado
2. Verifique a chave VAPID pública
3. Verifique se o navegador suporta push
4. Verifique a conexão HTTPS (necessária)

### Push não chega
1. Verifique se a edge function está deployada
2. Verifique os logs da edge function
3. Verifique se a subscrição está no banco
4. Verifique a chave VAPID privada

## Recursos Adicionais

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID](https://tools.ietf.org/html/rfc8292)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
