import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';

// todo: don't instanciate here
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();

export async function getBeefyApi(): Promise<BeefyAPI> {
  return beefyApi;
}
export async function getConfigApi(): Promise<ConfigAPI> {
  return configApi;
}
