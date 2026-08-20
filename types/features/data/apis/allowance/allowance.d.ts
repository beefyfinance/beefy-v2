import type { ChainEntity } from '../../entities/chain';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenErc20 } from '../../entities/token';
import type { VaultGov, VaultStandard } from '../../entities/vault';
import type { BeefyState } from '../../store/types';
import type { FetchAllAllowanceResult, IAllowanceApi } from './allowance-types';
export declare class AllowanceAPI<T extends ChainEntity> implements IAllowanceApi {
    protected chain: T;
    constructor(chain: T);
    fetchAllAllowances(state: BeefyState, standardVaults: VaultStandard[], govVaults: VaultGov[], boosts: BoostPromoEntity[], walletAddress: string): Promise<FetchAllAllowanceResult>;
    fetchTokensAllowance(state: BeefyState, tokens: TokenErc20[], walletAddress: string, spenderAddress: string): Promise<FetchAllAllowanceResult>;
}
