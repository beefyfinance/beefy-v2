import type BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
import type { MinterConfig } from '../config-types';

export interface IMinterApi {
  fetchMinterReserves(minter: MinterConfig): Promise<FetchMinterReservesResult>;
}

export type FetchMinterReservesResult = {
  id: MinterEntity['id'];
  reserves: BigNumber;
  totalSupply: BigNumber;
};
