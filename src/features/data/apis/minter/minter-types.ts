import BigNumber from 'bignumber.js';
import { MinterConfig } from '../config';

export interface IMinterApi {
  fetchMinterReserves(minter: MinterConfig): Promise<FetchMinterReservesResult>;
}

export type FetchMinterReservesResult = BigNumber;
