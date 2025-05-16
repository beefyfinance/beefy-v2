import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { TokenEntity, TokenErc20 } from '../../entities/token.ts';
import type { VaultGov, VaultStandard } from '../../entities/vault.ts';
import type { BeefyState } from '../../store/types.ts';

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
  ): Promise<FetchAllAllowanceResult>;
}

export interface TokenAllowance {
  tokenAddress: TokenEntity['address'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

export type FetchAllAllowanceResult = TokenAllowance[];
