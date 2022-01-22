import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _vaultAbi from '../../../config/abi/vault.json';
import _boostAbi from '../../../config/abi/boost.json';
import _erc20Abi from '../../../config/abi/erc20.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BoostEntity } from '../entities/boost';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];

export interface GovVaultPoolBalance {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}

export interface BoostBalance {
  boostId: BoostEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}
/**
 * Get vault contract data
 */
export class BoostBalanceAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchGovVaultPoolsBalance(
    vaults: VaultGov[],
    walletAddress: string
  ): Promise<GovVaultPoolBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const calls: ShapeWithLabel[] = [];

    for (const vault of vaults) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const poolContract = new this.web3.eth.Contract(boostAbi, vault.poolAddress);
      calls.push({
        vaultId: vault.id,
        balance: poolContract.methods.balanceOf(walletAddress),
        rewards: poolContract.methods.earned(walletAddress),
      });
    }
    const [results] = (await mc.all([calls])) as AllValuesAsString<GovVaultPoolBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        vaultId: result.vaultId,
        balance: new BigNumber(result.balance),
        rewards: new BigNumber(result.rewards),
      } as GovVaultPoolBalance;
    });
  }

  public async fetchBoostBalance(
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<BoostBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const calls: ShapeWithLabel[] = [];

    for (const boost of boosts) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);
      calls.push({
        boostId: boost.id,
        balance: earnContract.methods.balanceOf(walletAddress),
        rewards: earnContract.methods.earned(walletAddress),
      });
    }
    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        boostId: result.boostId,
        balance: new BigNumber(result.balance),
      } as BoostBalance;
    });
  }
}
