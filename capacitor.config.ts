import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'demo-customer-app',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
