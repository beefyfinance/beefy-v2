import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../selectors/tokens';
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
import { selectBoostById } from '../../selectors/boosts';
import { selectVaultById } from '../../selectors/vaults';

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

    const standardVaultCalls: ShapeWithLabel[] = [];
    for (const vault of standardVaults) {
      const earnedToken = selectErc20TokenByAddress(state, this.chain.id, vault.earnedTokenAddress);
      const vaultContract = getVaultContractInstance(earnedToken.address);
      standardVaultCalls.push({
        type: 'vault-standard',
        id: vault.id,
        balance: vaultContract.methods.balance(),
        pricePerFullShare: vaultContract.methods.getPricePerFullShare(),
        strategy: vaultContract.methods.strategy(),
      });
    }

    const govVaultCalls: ShapeWithLabel[] = [];
    for (const vault of govVaults) {
      const vaultContract = getVaultContractInstance(vault.earnContractAddress);
      govVaultCalls.push({
        type: 'vault-gov',
        id: vault.id,
        totalSupply: vaultContract.methods.totalSupply(),
      });
    }

    const boostsCalls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      // set a new address
      const boostContract = getBoostContractInstance(boost.earnContractAddress);
      boostsCalls.push({
        type: 'boost',
        id: boost.id,
        totalSupply: boostContract.methods.totalSupply(),
        rewardRate: boostContract.methods.rewardRate(),
        periodFinish: boostContract.methods.periodFinish(),
      });
    }

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
        const boost = selectBoostById(state, result.id);
        const earnedToken = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
        const vault = selectVaultById(state, boost.vaultId);
        const oracleToken = selectTokenByAddress(state, vault.chainId, vault.tokenAddress);
        const data = {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply).shiftedBy(-oracleToken.decimals),
          rewardRate: new BigNumber(result.rewardRate).shiftedBy(-earnedToken.decimals),
          /* assuming period finish is a UTC timestamp in seconds */
          periodFinish:
            result.periodFinish === '0' ? null : new Date(parseInt(result.periodFinish) * 1000),
        };
        res.boosts.push(data);
      } else if (result.type === 'vault-gov') {
        const vault = selectVaultById(state, result.id);
        const token = selectTokenByAddress(state, vault.chainId, vault.tokenAddress);
        const data = {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply).shiftedBy(-token.decimals),
        };
        res.govVaults.push(data);
      } else if (result.type === 'vault-standard') {
        const vault = selectVaultById(state, result.id);
        const mooToken = selectTokenByAddress(state, vault.chainId, vault.tokenAddress);
        const data = {
          id: result.id,
          balance: new BigNumber(result.balance).shiftedBy(-mooToken.decimals),
          /** always 18 decimals for PPFS */
          pricePerFullShare: new BigNumber(result.pricePerFullShare).shiftedBy(-18),
          strategy: result.strategy,
        };
        res.standardVaults.push(data);
      } else {
        console.error(result);
        throw new Error(`Could not identify type`);
      }
    }
    // format strings as numbers
    return res;
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
