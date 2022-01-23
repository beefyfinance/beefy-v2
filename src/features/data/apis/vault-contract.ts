import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenErc20 } from '../entities/token';
import _vaultAbi from '../../../config/abi/vault.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectTokenById } from '../selectors/tokens';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BeefyState } from '../../redux/reducers';

// fix TS typings
const vaultAbi = _vaultAbi as AbiItem[];

export interface GovVaultContractData {
  id: VaultEntity['id'];
  totalStaked: BigNumber;
}
export interface StandardVaultContractData {
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

  public async fetchGovVaultsContractData(vaults: VaultGov[]): Promise<GovVaultContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const vault of vaults) {
      const tokenContract = new this.web3.eth.Contract(vaultAbi, vault.earnContractAddress);
      calls.push({
        id: vault.id,
        totalStaked: tokenContract.methods.totalSupply(),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<GovVaultContractData>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        id: result.id,
        totalStaked: new BigNumber(result.totalStaked),
      } as GovVaultContractData;
    });
  }

  public async fetchStandardVaultsContractData(
    state: BeefyState,
    vaults: VaultStandard[]
  ): Promise<StandardVaultContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const vault of vaults) {
      const earnedToken = selectTokenById(state, this.chain.id, vault.earnedTokenId);
      // do this check to please the TypeScript gods
      if (!isTokenErc20(earnedToken)) {
        console.info(
          `VaultContractAPI.fetchStandardVaultsContractData: skipping non erc20 token ${earnedToken.id}`
        );
        continue;
      }
      const tokenContract = new this.web3.eth.Contract(vaultAbi, earnedToken.contractAddress);
      calls.push({
        id: vault.id,
        balance: tokenContract.methods.balance(),
        pricePerFullShare: tokenContract.methods.getPricePerFullShare(),
        strategy: tokenContract.methods.strategy(),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<StandardVaultContractData>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        id: result.id,
        balance: new BigNumber(result.balance),
        pricePerFullShare: new BigNumber(result.balance),
        strategy: result.strategy,
      } as StandardVaultContractData;
    });
  }
}
