import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenImplemErc20 } from '../entities/token';
import { ChainConfig } from './config';
import _erc20Abi from '../../../config/abi/erc20.json';
import _multicallAbi from '../../../config/abi/multicall.json';
import _boostAbi from '../../../config/abi/boost.json';
import _vaultAbi from '../../../config/abi/vault.json';
import Web3 from 'web3';
import { isGovVault, VaultEntity } from '../entities/vault';
import { BeefyState } from '../state';
import { tokenByIdSelector, tokenImplemByIdSelector } from '../selectors/tokens';

// fix TS typings
const vaultAbi = _vaultAbi as AbiItem[];

interface GovVaultContractData {
  id: VaultEntity['id'];
  totalStaked: number;
}
interface StandardVaultContractData {
  id: VaultEntity['id'];
  balance: number;
  pricePerFullShare: number;
  strategy: string;
}

type VaultContractResult = GovVaultContractData | StandardVaultContractData;

type PromisifyObjectType<T> = {
  [key in keyof T]: Promise<T[key]> | T[key];
};

export class VaultContractAPI {
  constructor(protected rpc: Web3) {}

  // maybe we want to re-render more often, we could make
  // this a generator instead
  public async fetchVaultsContractData(
    state: BeefyState,
    chainConfig: ChainConfig,
    vaults: VaultEntity[]
  ): Promise<VaultContractResult[]> {
    const mc = new MultiCall(this.rpc, chainConfig.multicallAddress);
    const calls: ShapeWithLabel[] = [];
    for (const vault of vaults) {
      if (isGovVault(vault)) {
        const tokenContract = new this.rpc.eth.Contract(vaultAbi, vault.poolAddress);
        calls.push({
          id: vault.id,
          totalStaked: tokenContract.methods.totalSupply(),
        });
      } else {
        const tokenImplem = tokenImplemByIdSelector(state, vault.earnedToken, vault.chainId);
        if (!isTokenImplemErc20(tokenImplem)) {
          continue;
        }
        const tokenContract = new this.rpc.eth.Contract(vaultAbi, tokenImplem.contractAddress);
        calls.push({
          id: vault.id,
          balance: tokenContract.methods.balance(),
          pricePerFullShare: tokenContract.methods.getPricePerFullShare(),
          strategy: tokenContract.methods.strategy(),
        });
      }
    }

    return new Promise<VaultContractResult[]>(async (resolve, reject) => {
      try {
        const result = await mc.all([calls]);
        resolve(result[0]);
      } catch (e) {
        console.warn('fetchVaultsContractData error', e);
        // FIXME: queue chain retry?
        reject(e);
      }
    });
  }
}
