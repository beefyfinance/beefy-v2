import { MinterConfig } from '../apis/config';
import { ChainEntity } from './chain';
import BigNumber from 'bignumber.js';

export type MinterEntity = MinterConfig & { chainId: ChainEntity['id']; reserves: BigNumber };
