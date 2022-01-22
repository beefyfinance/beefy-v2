import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenErc20 } from '../entities/token';
import _boostAbi from '../../../config/abi/boost.json';
import Web3 from 'web3';
import { selectTokenById } from '../selectors/tokens';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BeefyState } from '../../redux/reducers';

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

  public async fetchBoostContractData(
    state: BeefyState,
    boosts: BoostEntity[]
  ): Promise<BoostContractData[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      const earnedToken = selectTokenById(state, boost.earnedTokenId);
      if (!isTokenErc20(earnedToken)) {
        console.info(
          `BoostContractAPI.fetchBoostContractData: Skipping non erc20 token ${earnedToken.id}`
        );
        continue;
      }
      const tokenContract = new this.web3.eth.Contract(boostAbi, earnedToken.contractAddress);
      calls.push({
        id: boost.id,
        totalStaked: tokenContract.methods.totalSupply(),
        rewardRate: tokenContract.methods.rewardRate(),
        periodFinish: tokenContract.methods.periodFinish(),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostContractData>[][];

    console.log({ results });
    // format strings as numbers
    return results.map(result => {
      return {
        id: result.id,
        totalStaked: new BigNumber(result.totalStaked),
        rewardRate: new BigNumber(result.rewardRate),
        periodFinish: parseFloat(result.periodFinish),
      } as BoostContractData;
    });
  }
}
