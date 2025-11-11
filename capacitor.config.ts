import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f935dbcdb0c4aea8f60ee1666f3f1c5',
  appName: 'assiatente-de-programacao-52490',
  webDir: 'dist',
  server: {
    url: 'https://7f935dbc-db0c-4aea-8f60-ee1666f3f1c5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
