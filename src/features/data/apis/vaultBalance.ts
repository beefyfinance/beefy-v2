import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _vaultAbi from '../../../config/abi/vault.json';
import _boostAbi from '../../../config/abi/boost.json';
import _erc20Abi from '../../../config/abi/erc20.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];
const vaultAbi = _vaultAbi as AbiItem[];
const erc20Abi = _erc20Abi as AbiItem[];

export interface GovVaultBalance {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}
/**
 * Get vault contract data
 */
export class VaultBalanceAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  // maybe we want to re-render more often, we could make
  // this a generator instead
  // TODO: should this be a token? are those erc20?
  public async fetchGovVaultsBalance(
    vaults: VaultGov[],
    walletAddress: string
  ): Promise<GovVaultBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const calls: ShapeWithLabel[] = vaults.map(vault => {
      const poolContract = new this.web3.eth.Contract(vaultAbi, vault.poolAddress);

      return {
        vaultId: vault.id,
        balance: poolContract.methods.balanceOf(walletAddress),
        rewards: poolContract.methods.earned(walletAddress),
      };
    });

    const [results] = (await mc.all([calls])) as AllValuesAsString<GovVaultBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        vaultId: result.vaultId,
        balance: new BigNumber(result.balance),
        rewards: new BigNumber(result.rewards),
      } as GovVaultBalance;
    });
  }
}
