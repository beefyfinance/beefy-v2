import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../../redux-types';
import { MinterConfig } from '../config';

export interface IMinterApi {
  fetchAllReserves(state: BeefyState, minters: MinterConfig[]): Promise<FetchAllReservesResult>;
}

export type TokenReserves = BigNumber;

export interface FetchAllReservesResult {
  reserves: TokenReserves;
}
