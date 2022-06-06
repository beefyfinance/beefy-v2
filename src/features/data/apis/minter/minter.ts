import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { FetchMinterReservesResult, IMinterApi } from './minter-types';
import { getContract } from '../../../../helpers/getContract';
import MinterAbi from '../../../../config/abi/minter.json';
import BigNumber from 'bignumber.js';
import { MinterEntity } from '../../entities/minter';
import { BIG_ZERO } from '../../../../helpers/big-number';

export class MinterApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}
  public async fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult> {
    if (minter.canBurnReserves) {
      const contract = getContract(minter.contractAddress, this.web3, MinterAbi);
      const data: BigNumber = await contract?.methods[minter.reserveBalanceMethod]().call();
      return new BigNumber(data);
    } else {
      return new BigNumber(BIG_ZERO);
    }
  }
}
