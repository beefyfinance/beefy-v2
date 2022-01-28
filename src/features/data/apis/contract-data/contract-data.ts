import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { isTokenErc20 } from '../../entities/token';
import _vaultAbi from '../../../../config/abi/vault.json';
import _boostAbi from '../../../../config/abi/boost.json';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { selectTokenById } from '../../selectors/tokens';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BeefyState } from '../../../redux/reducers';
import { BoostEntity } from '../../entities/boost';
import { sortBy } from 'lodash';
import { getBoostContractInstance, getVaultContractInstance } from './worker/instances';
import {
  BoostContractData,
  FetchAllResult,
  GovVaultContractData,
  StandardVaultContractData,
} from './worker/shared-worker-types';

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
    //@ts-ignore
    if (!window._res) {
      // @ts-ignore
      window._res = { boosts: [], govVaults: [], standardVaults: [] };
    }
    // @ts-ignore
    window._res.boosts = window._res.boosts.concat(res.boosts);
    // @ts-ignore
    window._res.govVaults = window._res.govVaults.concat(res.govVaults);
    // @ts-ignore
    window._res.standardVaults = window._res.standardVaults.concat(res.standardVaults);
    // @ts-ignore
    window._res.boosts = sortBy(window._res.boosts, ['id']);
    // @ts-ignore
    window._res.govVaults = sortBy(window._res.govVaults, ['id']);
    // @ts-ignore
    window._res.standardVaults = sortBy(window._res.standardVaults, ['id']);
    console.log({ res });
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
      const vaultContract = getVaultContractInstance(earnedToken.contractAddress);
      calls.push({
        type: 'vault-standard',
        id: vault.id,
        balance: vaultContract.methods.balance(),
        pricePerFullShare: vaultContract.methods.getPricePerFullShare(),
        strategy: vaultContract.methods.strategy(),
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
      const vaultContract = getVaultContractInstance(vault.earnContractAddress);
      calls.push({
        type: 'vault-gov',
        id: vault.id,
        totalStaked: vaultContract.methods.totalSupply(),
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
      // set a new address
      const boostContract = getBoostContractInstance(boost.earnContractAddress);

      calls.push({
        type: 'boost',
        id: boost.id,
        totalStaked: boostContract.methods.totalSupply(),
        rewardRate: boostContract.methods.rewardRate(),
        periodFinish: boostContract.methods.periodFinish(),
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
