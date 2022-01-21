import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import { VaultContractAPI } from './vaultContract';
import { BoostContractAPI } from './boostContract';
import { ChainEntity } from '../entities/chain';
import Web3 from 'web3';

// todo: maybe don't instanciate here, idk yet
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();

/**
 * These are basically factories so user code don't have to worry
 * about creating those API objects
 */

export async function getBeefyApi(): Promise<BeefyAPI> {
  return beefyApi;
}
export async function getConfigApi(): Promise<ConfigAPI> {
  return configApi;
}

const vaultContractApiByChainId: { [chainId: ChainEntity['id']]: VaultContractAPI } = {};
export async function getVaultContractApi(chain: ChainEntity): Promise<VaultContractAPI> {
  if (vaultContractApiByChainId[chain.id] === undefined) {
    const web3 = await getWeb3Instance(chain);
    console.debug(`Instanciating VaultContractAPI for chain ${chain.id}`);
    vaultContractApiByChainId[chain.id] = new VaultContractAPI(web3, chain);
  }

  return vaultContractApiByChainId[chain.id];
}

const boostContractApiByChainId: { [chainId: ChainEntity['id']]: BoostContractAPI } = {};
export async function getBoostContractApi(chain: ChainEntity): Promise<BoostContractAPI> {
  if (boostContractApiByChainId[chain.id] === undefined) {
    const web3 = await getWeb3Instance(chain);
    console.debug(`Instanciating BoostContractAPI for chain ${chain.id}`);
    boostContractApiByChainId[chain.id] = new BoostContractAPI(web3, chain);
  }
  return boostContractApiByChainId[chain.id];
}

// have a local cache of Web3 objects
const web3InstancesByChainId: { [chainId: ChainEntity['id']]: Web3 } = {};
async function getWeb3Instance(chain: ChainEntity): Promise<Web3> {
  const chainId = chain.id;

  // todo: do something with web3 modal
  if (web3InstancesByChainId[chainId] === undefined) {
    // pick one RPC endpoint at random
    // todo: not the smartest thing to do but good enough yet
    const rpc = chain.rpc[~~(chain.rpc.length * Math.random())];
    console.debug('Instanciating Web3');
    web3InstancesByChainId[chainId] = new Web3(rpc);
  }
  return web3InstancesByChainId[chainId];
}
