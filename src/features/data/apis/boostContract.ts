import { MultiCall } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenErc20 } from '../entities/token';
import { ChainConfig } from './config';
import _boostAbi from '../../../config/abi/boost.json';
import Web3 from 'web3';
import { BeefyState } from '../state';
import { tokenByIdSelector } from '../selectors/tokens';
import { BoostEntity } from '../entities/boost';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];

interface BoostContractData {
  id: BoostEntity['id'];
  totalStaked: number;
  rewardRate: number;
  periodFinish: number;
}
type AllValuesAsString<T> = {
  [key in keyof T]: string;
};

/**
 * Get vault contract data
 */
export class VaultContractAPI {
  constructor(protected rpc: Web3) {}

  public async fetchBoostContractData(
    state: BeefyState,
    chainConfig: ChainConfig,
    boosts: BoostEntity[]
  ): Promise<BoostContractData[]> {
    const mc = new MultiCall(this.rpc, chainConfig.multicallAddress);

    const calls = boosts.map(boost => {
      const earnedToken = tokenByIdSelector(state, boost.earnedTokenId);
      if (!isTokenErc20(earnedToken)) {
        return;
      }
      const tokenContract = new this.rpc.eth.Contract(boostAbi, earnedToken.contractAddress);
      return {
        id: boost.id,
        totalStaked: tokenContract.methods.totalSupply(),
        rewardRate: tokenContract.methods.rewardRate(),
        periodFinish: tokenContract.methods.periodFinish(),
      };
    });

    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostContractData>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        id: result.id,
        totalStaked: parseFloat(result.totalStaked),
        rewardRate: parseFloat(result.rewardRate),
        periodFinish: parseFloat(result.periodFinish),
      } as BoostContractData;
    });
  }
}
