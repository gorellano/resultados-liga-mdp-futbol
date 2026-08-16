import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.costaygol.app',
  appName: 'Costa y Gol',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
