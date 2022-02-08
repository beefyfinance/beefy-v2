import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { isTokenErc20 } from '../../entities/token';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { selectTokenById } from '../../selectors/tokens';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import {
  BoostContractData,
  FetchAllContractDataResult,
  GovVaultContractData,
  IContractDataApi,
  StandardVaultContractData,
} from './contract-data-types';
import { AbiItem } from 'web3-utils';
import { BeefyState } from '../../../../redux-types';
import * as _Web3Contract from 'web3-eth-contract';
import { Contract } from 'web3-eth-contract';
import _vaultAbi from '../../../../config/abi/vault.json';
import _boostAbi from '../../../../config/abi/boost.json';

// fix TS typings
const vaultAbi = _vaultAbi as AbiItem[];
const boostAbi = _boostAbi as AbiItem[];
const Web3Contract = _Web3Contract as any as Contract;

/**
 * Get vault contract data
 */
export class ContractDataAPI implements IContractDataApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
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

    const res: FetchAllContractDataResult = {
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
          /** always 18 decimals for PPFS */
          pricePerFullShare: new BigNumber(result.pricePerFullShare).shiftedBy(-18),
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
        totalSupply: vaultContract.methods.totalSupply(),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<GovVaultContractData>) => {
        return {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply),
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
        totalSupply: boostContract.methods.totalSupply(),
        rewardRate: boostContract.methods.rewardRate(),
        periodFinish: boostContract.methods.periodFinish(),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<BoostContractData>) => {
        return {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply),
          rewardRate: new BigNumber(result.rewardRate),
          /* assuming period finish is a UTC timestamp in seconds */
          periodFinish: new Date(parseInt(result.periodFinish) * 1000),
        } as BoostContractData;
      },
    };
  }
}

// turns out instanciating contracts is CPU heavy
// so we instanciate them only once and clone them
const baseContractCache: { vault: Contract | null; boost: Contract | null } = {
  boost: null,
  vault: null,
};

function getVaultContractInstance(address: string) {
  if (baseContractCache.vault === null) {
    // @ts-ignore types of 'web3-eth-contract' are badly defined
    baseContractCache.vault = new Web3Contract(vaultAbi);
  }
  const vaultContract = baseContractCache.vault.clone();
  vaultContract.options.address = address;
  return vaultContract;
}

function getBoostContractInstance(address: string) {
  if (baseContractCache.boost === null) {
    // @ts-ignore types of 'web3-eth-contract' are badly defined
    baseContractCache.boost = new Web3Contract(boostAbi);
  }
  const boostContract = baseContractCache.boost.clone();
  boostContract.options.address = address;
  return boostContract;
}
