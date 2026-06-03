import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dfenceprep.app',
  appName: 'Dfence Prep',
  webDir: 'public',
  server: {
    url: 'https://dfenceprep.com', // Change this to your production URL when ready
    cleartext: true
  }
};

export default config;
