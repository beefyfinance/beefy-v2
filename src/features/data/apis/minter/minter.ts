import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import type { FetchMinterReservesResult, IMinterApi } from './minter-types';
import { getContract } from '../../../../helpers/getContract';
import MinterAbi from '../../../../config/abi/minter.json';
import BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
import { BIG_ZERO } from '../../../../helpers/big-number';

export class MinterApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}
  public async fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult> {
    if (minter.canBurnReserves && minter.burnerAddress) {
      const contract = getContract(minter.burnerAddress, this.web3, MinterAbi);
      const data: BigNumber = await contract?.methods[minter.reserveBalanceMethod]().call();
      return new BigNumber(data);
    } else {
      return new BigNumber(BIG_ZERO);
    }
  }
}
