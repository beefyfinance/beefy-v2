import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import type { FetchMinterReservesResult, IMinterApi } from './minter-types';
import { MinterAbi } from '../../../../config/abi/MinterAbi';
import BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { viemToWeb3Abi } from '../../../../helpers/web3';

export class MinterApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}
  public async fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult> {
    if (minter.canBurnReserves && minter.burnerAddress) {
      if (!minter.reserveBalanceMethod) {
        throw new Error('Reserve balance method not found');
      }
      const contract = new this.web3.eth.Contract(viemToWeb3Abi(MinterAbi), minter.burnerAddress);
      const data: BigNumber = await contract.methods[minter.reserveBalanceMethod]().call();
      return new BigNumber(data);
    } else {
      return new BigNumber(BIG_ZERO);
    }
  }
}
