import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity, TokenErc20 } from '../../entities/token';
import type { VaultGov, VaultStandard } from '../../entities/vault';

export interface IAllowanceApi {
  fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostPromoEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult>;

  fetchTokensAllowance(
    state: BeefyState,
    tokens: TokenErc20[],
    walletAddress: string,
    spenderAddress: string
  );
}

export interface TokenAllowance {
  tokenAddress: TokenEntity['address'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

export type FetchAllAllowanceResult = TokenAllowance[];
