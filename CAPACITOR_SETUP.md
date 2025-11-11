# 📱 Configuração do App Nativo - Capacitor

Seu app agora está configurado para funcionar como um app nativo com **notificações em segundo plano**!

## 🚀 Próximos Passos

### 1. Exportar para o GitHub
Clique no botão do GitHub no topo direito do Lovable para exportar seu projeto.

### 2. Clonar o Projeto
```bash
git clone [SEU_REPOSITORIO_GITHUB]
cd assiatente-de-programacao-52490
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Inicializar Capacitor
```bash
npx cap init
```
Quando solicitado, apenas pressione Enter para aceitar as configurações já definidas no `capacitor.config.ts`.

### 5. Build do Projeto
```bash
npm run build
```

### 6. Adicionar Plataforma

**Para Android:**
```bash
npx cap add android
npx cap update android
npx cap sync
npx cap run android
```

**Para iOS (requer Mac com Xcode):**
```bash
npx cap add ios
npx cap update ios
npx cap sync
npx cap open ios
```

## 📱 Testando no Dispositivo

### Android (requer Android Studio instalado)
1. Conecte seu celular via USB com depuração USB ativada
2. Execute: `npx cap run android`
3. O app será instalado e executado no seu dispositivo

### iOS (requer Mac com Xcode)
1. Execute: `npx cap open ios`
2. No Xcode, conecte seu iPhone
3. Selecione seu dispositivo e clique em Run

## ✨ Funcionalidades Nativas Habilitadas

- ✅ **Notificações em Segundo Plano**: Funcionam mesmo com tela bloqueada
- ✅ **Som de Notificação**: Toca quando a tarefa é acionada
- ✅ **Integração Nativa**: App roda nativamente no dispositivo
- ✅ **Hot Reload**: Durante desenvolvimento, o app conecta ao servidor Lovable

## 🔄 Após Modificações no Código

Sempre que você modificar o código no Lovable:
1. Git pull no seu projeto local
2. Execute: `npm run build`
3. Execute: `npx cap sync`

## 📚 Recursos Adicionais

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Local Notifications Plugin](https://capacitorjs.com/docs/apis/local-notifications)
- [Capacitor no Lovable](https://docs.lovable.dev/tips-tricks/capacitor)

## ⚠️ Requisitos

**Para Android:**
- Android Studio instalado
- Java JDK 11 ou superior

**Para iOS:**
- Mac com macOS
- Xcode instalado
- Conta Apple Developer (para publicar na App Store)

## 🎯 Próximos Passos Opcionais

- Customizar ícone e splash screen
- Configurar permissões específicas do Android/iOS
- Publicar na Play Store ou App Store
- Adicionar mais funcionalidades nativas (câmera, geolocalização, etc.)
