import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenBoost, isTokenErc20 } from '../entities/token';
import _vaultAbi from '../../../config/abi/vault.json';
import _boostAbi from '../../../config/abi/boost.json';
import _erc20Abi from '../../../config/abi/erc20.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { BeefyState } from '../state';
import { selectTokenById } from '../selectors/tokens';
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
export interface StandardVaultBalance {
  id: VaultEntity['id'];

  balance: BigNumber;

  /**
   * pricePerFullShare is how you find out how much your mooTokens (shares)
   * represent in term of the underlying asset
   * So if you deposit 1 BNB you will get, for example 0.95 mooBNB,
   * with a ppfs of X. if you multiply your mooBNB * ppfs you get your amount in BNB
   */
  pricePerFullShare: BigNumber;

  /**
   * The strategy address
   */
  strategy: string;
}

/**
 * Get vault contract data
 */
export class VaultContractAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  // maybe we want to re-render more often, we could make
  // this a generator instead
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
  /*
  // maybe we want to re-render more often, we could make
  // this a generator instead
  public async fetchStandardVaultsContractData(
    state: BeefyState,
    vaults: VaultStandard[]
  ): Promise<StandardVaultBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls = vaults.map(vault => {
      const token = selectTokenById(state, vault.oracleId);
      if (!isTokenErc20(token)) {
        console.info(
          `VaultContractAPI.fetchStandardVaultsContractData: skipping non erc20 token ${token.id}`
        );
        return;
      }
      const tokenContract = new this.web3.eth.Contract(vaultAbi, token.contractAddress);
      return {
        id: vault.id,
        balance: tokenContract.methods.balance(),
        pricePerFullShare: tokenContract.methods.getPricePerFullShare(),
        strategy: tokenContract.methods.strategy(),
      };
    });

    const [results] = (await mc.all([calls])) as AllValuesAsString<StandardVaultBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        vaultId: result.vaultId,
      } as StandardVaultBalance;
    });
  }*/
}
