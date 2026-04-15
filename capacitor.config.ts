import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.obrago.app',
  appName: 'Obra Go',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#000000'
};

export default config;
