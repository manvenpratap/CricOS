export * from './api/mobile-client.js';
export * from './screens/LiveMatchScreen.js';
export * from './screens/MarketplaceScreen.js';
export * from './screens/ProfileScreen.js';

import { CricOSMobileClient, type MobileClientOptions } from './api/mobile-client.js';

export type MobileScreenType = 'LIVE_MATCH' | 'MARKETPLACE' | 'PROFILE';

export class CricOSMobileApp {
  private client: CricOSMobileClient;
  private currentScreen: MobileScreenType = 'LIVE_MATCH';

  constructor(options: MobileClientOptions = {}) {
    this.client = new CricOSMobileClient(options);
  }

  public getClient(): CricOSMobileClient {
    return this.client;
  }

  public getCurrentScreen(): MobileScreenType {
    return this.currentScreen;
  }

  public navigateTo(screen: MobileScreenType): void {
    this.currentScreen = screen;
  }
}
