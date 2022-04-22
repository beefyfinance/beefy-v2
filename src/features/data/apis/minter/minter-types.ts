import BigNumber from 'bignumber.js';
import { MinterEntity } from '../../entities/minter';
import { MinterConfig } from '../config-types';

export interface IMinterApi {
  fetchMinterReserves(minter: MinterConfig): Promise<FetchMinterReservesResult>;
}

export type FetchMinterReservesResult = BigNumber;

export interface FetchMinterReservesReloadResult {
  id: MinterEntity['id'];
  reserves: BigNumber;
}
