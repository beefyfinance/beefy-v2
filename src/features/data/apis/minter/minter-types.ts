import BigNumber from 'bignumber.js';
import { MinterConfig } from '../config';

export interface IMinterApi {
  fetchAllReserves(minters: MinterConfig[]): Promise<FetchAllReservesResult>;
}

export interface TokenReserves {
  id: MinterConfig['id'];
  reserves: BigNumber;
}

export type FetchAllReservesResult = TokenReserves[];
