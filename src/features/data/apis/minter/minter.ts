import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import type { FetchMinterReservesResult, IMinterApi } from './minter-types';
import { MinterAbi } from '../../../../config/abi/MinterAbi';
import { BigNumber } from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
import { viemToWeb3Abi } from '../../../../helpers/web3';
import { MultiCall, type ShapeWithLabel } from 'eth-multicall';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi';

export class MinterApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult> {
    const multicall = new MultiCall(this.web3, this.chain.multicallAddress);
    const fetchReserves = minter.canBurn && minter.burnerAddress;
    const tokenContract = new this.web3.eth.Contract(
      viemToWeb3Abi(ERC20Abi),
      minter.mintedToken.contractAddress
    );
    const calls: ShapeWithLabel[][] = [
      [
        {
          totalSupply: tokenContract.methods.totalSupply(),
        },
      ],
    ];

    if (fetchReserves) {
      if (!minter.reserveBalanceMethod) {
        throw new Error('Reserve balance method not found');
      }
      const burnerContract = new this.web3.eth.Contract(
        viemToWeb3Abi(MinterAbi),
        minter.burnerAddress
      );
      calls.push([
        {
          reserves: burnerContract.methods[minter.reserveBalanceMethod](),
        },
      ]);
    }

    const results = await multicall.all(calls);
    const result = results
      .flat()
      .flat()
      .reduce((acc, res) => ({ ...acc, ...res }), {}) as { totalSupply: string; reserves?: string };

    return {
      id: minter.id,
      reserves: new BigNumber(result.reserves || '0'),
      totalSupply: new BigNumber(result.totalSupply),
    };
  }
}
