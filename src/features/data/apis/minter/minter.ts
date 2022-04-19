import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { IMinterApi, FetchMinterReservesResult } from './minter-types';
import { MinterConfig } from '../config';
import { getContract } from '../../../../helpers/getContract';
import MinterAbi from '../../../../config/abi/minter.json';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../helpers/format';

export class MinterApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}
  public async fetchMinterReserves(minter: MinterConfig): Promise<FetchMinterReservesResult> {
    if (minter.canBurnReserves) {
      const contract = getContract(minter.contractAddress, this.web3, MinterAbi);
      const data: BigNumber = await contract?.methods.balanceOfWant().call();
      return new BigNumber(data);
    } else {
      return new BigNumber(BIG_ZERO);
    }
  }
}
