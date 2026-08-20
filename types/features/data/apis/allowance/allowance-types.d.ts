import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity, TokenErc20 } from '../../entities/token';
import type { VaultGov, VaultStandard } from '../../entities/vault';
import type { BeefyState } from '../../store/types';
export interface IAllowanceApi {
    fetchAllAllowances(state: BeefyState, standardVaults: VaultStandard[], govVaults: VaultGov[], boosts: BoostPromoEntity[], walletAddress: string): Promise<FetchAllAllowanceResult>;
    fetchTokensAllowance(state: BeefyState, tokens: TokenErc20[], walletAddress: string, spenderAddress: string): Promise<FetchAllAllowanceResult>;
}
export interface TokenAllowance {
    tokenAddress: TokenEntity['address'];
    spenderAddress: string;
    allowance: BigNumber;
}
export type FetchAllAllowanceResult = TokenAllowance[];
