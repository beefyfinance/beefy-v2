import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _boostAbi from '../../../config/abi/boost.json';
import Web3 from 'web3';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];

export interface BoostContractData {
  id: BoostEntity['id'];
  totalStaked: BigNumber;
  rewardRate: BigNumber;
  periodFinish: number;
}

/**
 * Get vault contract data
 */
export class BoostContractAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchBoostContractData(boosts: BoostEntity[]): Promise<BoostContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);

      calls.push({
        id: boost.id,
        totalStaked: earnContract.methods.totalSupply(),
        rewardRate: earnContract.methods.rewardRate(),
        periodFinish: earnContract.methods.periodFinish(),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostContractData>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        id: result.id,
        totalStaked: new BigNumber(result.totalStaked),
        rewardRate: new BigNumber(result.rewardRate),
        periodFinish: parseInt(result.periodFinish),
      } as BoostContractData;
    });
  }
}
