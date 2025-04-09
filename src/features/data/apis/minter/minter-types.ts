import type BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter.ts';
import type { MinterConfig } from '../config-types.ts';

export interface IMinterApi {
  fetchMinterReserves(minter: MinterConfig): Promise<FetchMinterReservesResult>;
}

export type FetchMinterReservesResult = {
  id: MinterEntity['id'];
  reserves: BigNumber;
  totalSupply: BigNumber;
};
