import type { ChainEntity } from '../../entities/chain.ts';
import type { FetchMinterReservesResult, IMinterApi } from './minter-types.ts';
import { MinterAbi } from '../../../../config/abi/MinterAbi.ts';
import BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter.ts';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';

export class MinterApi implements IMinterApi {
  constructor(protected chain: ChainEntity) {}

  public async fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult> {
    const tokenContract = fetchContract(
      minter.mintedToken.contractAddress,
      ERC20Abi,
      this.chain.id
    );
    const fetchReserves = minter.canBurn && minter.burnerAddress;

    if (fetchReserves && !minter.reserveBalanceMethod) {
      throw new Error('Reserve balance method not found');
    }

    const [totalSupply, reserves] = await Promise.all([
      tokenContract.read.totalSupply(),
      fetchReserves ?
        fetchContract(minter.burnerAddress!, MinterAbi, this.chain.id).read[
          minter.reserveBalanceMethod!
        ]()
      : 0n,
    ]);

    return {
      id: minter.id,
      reserves: new BigNumber(reserves?.toString() || '0'),
      totalSupply: new BigNumber(totalSupply.toString()),
    };
  }
}
