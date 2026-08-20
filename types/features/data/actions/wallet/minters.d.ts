import type { ChainEntity } from '../../entities/chain';
import { type TokenEntity } from '../../entities/token';
import type BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
export declare const mintDeposit: (minter: MinterEntity, payToken: TokenEntity, mintedToken: TokenEntity, amount: BigNumber, max: boolean, _slippageTolerance?: number) => import("../../store/types").BeefyThunk;
export declare const burnWithdraw: (chainId: ChainEntity["id"], contractAddr: string, withdrawnToken: TokenEntity, burnedToken: TokenEntity, amount: BigNumber, _max: boolean, minterId: MinterEntity["id"]) => import("../../store/types").BeefyThunk;
