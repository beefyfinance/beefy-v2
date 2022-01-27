import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenErc20 } from '../entities/token';
import _vaultAbi from '../../../config/abi/vault.json';
import _boostAbi from '../../../config/abi/boost.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectTokenById } from '../selectors/tokens';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BeefyState } from '../../redux/reducers';
import { BoostEntity } from '../entities/boost';

// fix TS typings
const vaultAbi = _vaultAbi as AbiItem[];
const boostAbi = _boostAbi as AbiItem[];

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

export interface BoostContractData {
  id: BoostEntity['id'];
  totalStaked: BigNumber;
  rewardRate: BigNumber;
  periodFinish: number;
}

interface FetchAllResult {
  boosts: BoostContractData[];
  standardVaults: StandardVaultContractData[];
  govVaults: GovVaultContractData[];
}

/**
 * Get vault contract data
 */
export class ContractDataAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchGovVaultsContractData(vaults: VaultGov[]): Promise<GovVaultContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const { calls, formatter } = this._getGovVaultCallsAndFormatter(vaults);

    const [results] = (await mc.all([calls])) as AllValuesAsString<GovVaultContractData>[][];

    // format strings as numbers
    return results.map(formatter);
  }

  public async fetchStandardVaultsContractData(
    state: BeefyState,
    vaults: VaultStandard[]
  ): Promise<StandardVaultContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const { calls, formatter } = this._getStandardVaultCallsAndFormatter(state, vaults);
    const [results] = (await mc.all([calls])) as AllValuesAsString<StandardVaultContractData>[][];

    // format strings as numbers
    return results.map(formatter);
  }

  public async fetchBoostContractData(boosts: BoostEntity[]): Promise<BoostContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const { calls, formatter } = this._getBoostCallsAndFormatter(boosts);
    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostContractData>[][];

    // format strings as numbers
    return results.map(formatter);
  }

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllResult> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const { calls: standardVaultCalls, formatter: standardVaultFormatter } =
      this._getStandardVaultCallsAndFormatter(state, standardVaults);
    const { calls: govVaultCalls, formatter: govVaultFormatter } =
      this._getGovVaultCallsAndFormatter(govVaults);
    const { calls: boostsCalls, formatter: boostsFormatter } =
      this._getBoostCallsAndFormatter(boosts);

    const calls = [...standardVaultCalls, ...govVaultCalls, ...boostsCalls];

    type ResultType =
      | ({ type: 'boost' } & AllValuesAsString<BoostContractData>)
      | ({ type: 'vault-gov' } & AllValuesAsString<GovVaultContractData>)
      | ({ type: 'vault-standard' } & AllValuesAsString<StandardVaultContractData>);
    const [results] = (await mc.all([calls])) as ResultType[][];

    const res: FetchAllResult = {
      boosts: [],
      govVaults: [],
      standardVaults: [],
    };
    for (const result of results) {
      if (result.type === 'boost') {
        res.boosts.push(boostsFormatter(result));
      } else if (result.type === 'vault-gov') {
        res.govVaults.push(govVaultFormatter(result));
      } else if (result.type === 'vault-standard') {
        res.standardVaults.push(standardVaultFormatter(result));
      } else {
        console.error(result);
        throw new Error(`Could not identify type`);
      }
    }
    // format strings as numbers
    return res;
  }

  protected _getStandardVaultCallsAndFormatter(state: BeefyState, vaults: VaultStandard[]) {
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
        type: 'vault-standard',
        id: vault.id,
        balance: tokenContract.methods.balance(),
        pricePerFullShare: tokenContract.methods.getPricePerFullShare(),
        strategy: tokenContract.methods.strategy(),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<StandardVaultContractData>) => {
        return {
          id: result.id,
          balance: new BigNumber(result.balance),
          pricePerFullShare: new BigNumber(result.balance),
          strategy: result.strategy,
        } as StandardVaultContractData;
      },
    };
  }

  protected _getGovVaultCallsAndFormatter(vaults: VaultGov[]) {
    const calls: ShapeWithLabel[] = [];
    for (const vault of vaults) {
      const tokenContract = new this.web3.eth.Contract(vaultAbi, vault.earnContractAddress);
      calls.push({
        type: 'vault-gov',
        id: vault.id,
        totalStaked: tokenContract.methods.totalSupply(),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<GovVaultContractData>) => {
        return {
          id: result.id,
          totalStaked: new BigNumber(result.totalStaked),
        } as GovVaultContractData;
      },
    };
  }

  protected _getBoostCallsAndFormatter(boosts: BoostEntity[]) {
    const calls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);

      calls.push({
        type: 'boost',
        id: boost.id,
        totalStaked: earnContract.methods.totalSupply(),
        rewardRate: earnContract.methods.rewardRate(),
        periodFinish: earnContract.methods.periodFinish(),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<BoostContractData>) => {
        return {
          id: result.id,
          totalStaked: new BigNumber(result.totalStaked),
          rewardRate: new BigNumber(result.rewardRate),
          periodFinish: parseInt(result.periodFinish),
        } as BoostContractData;
      },
    };
  }
}
