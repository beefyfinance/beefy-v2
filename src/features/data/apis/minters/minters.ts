import Web3 from 'web3';
import { ChainEntity } from '../../entities/chain';
import { IMinterApi, FetchAllReservesResult, TokenReserves } from './minters-type';
import { MinterConfig } from '../config';
import { BeefyState } from '../../../../redux-types';
import { getContract } from '../../../../helpers/getContract';
import MinterAbi from '../../../../config/abi/minter.json';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../helpers/format';

export class MintersApi implements IMinterApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}
  public async fetchAllReserves(
    state: BeefyState,
    minters: MinterConfig[]
  ): Promise<FetchAllReservesResult> {
    const res: FetchAllReservesResult = {
      reserves: new BigNumber(BIG_ZERO),
    };

    for (const minter of minters) {
      if (minter.canBurnWithReserves) {
        const contract = getContract(minter.contractAddress, this.web3, MinterAbi);
        const data: TokenReserves = await contract?.methods.balanceOfWant().call();
        res.reserves = data;
      }
      return res;
    }
  }
}
