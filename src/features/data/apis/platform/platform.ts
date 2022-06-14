import { IPlatformApi, PlatformConfig } from './platform-types';

export class PlatformApi implements IPlatformApi {
  public async fetchPlatforms(): Promise<PlatformConfig[]> {
    return (await import('../../../../config/platforms.json')).default;
  }
}
