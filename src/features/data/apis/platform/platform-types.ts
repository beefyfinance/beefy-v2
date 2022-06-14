export interface IPlatformApi {
  fetchPlatforms(): Promise<PlatformConfig[]>;
}

export type PlatformConfig = {
  id: string;
  name: string;
  filter: boolean;
};
