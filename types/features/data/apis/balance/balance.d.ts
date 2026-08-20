import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import { type PublicClient } from 'viem';
import type { ChainEntity } from '../../entities/chain';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity, TokenNative } from '../../entities/token';
import { type VaultErc4626AsyncWithdraw, type VaultGovCowcentrated, type VaultGovMulti, type VaultGovSingle } from '../../entities/vault';
import type { BeefyState } from '../../store/types';
import type { BoostBalance, BoostBalanceContractData, FetchAllBalancesEntities, FetchAllBalancesResult, GovVaultBalance, GovVaultMultiBalanceContractData, GovVaultSingleBalanceContractData, IBalanceApi, TokenBalance } from './balance-types';
export declare class BalanceAPI<T extends ChainEntity> implements IBalanceApi {
    protected chain: T;
    constructor(chain: T);
    fetchAllBalances(state: BeefyState, { tokens, govVaults, boosts, erc4626Vaults }: FetchAllBalancesEntities, _walletAddress: string): Promise<FetchAllBalancesResult>;
    protected erc4626PendingWithdrawals(state: BeefyState, client: PublicClient, vault: VaultErc4626AsyncWithdraw, walletAddress: Address): Promise<{
        requests: {
            id: bigint;
            shares: BigNumber;
            assets: BigNumber;
            requestTimestamp: number;
            claimableTimestamp: number;
            emergency: boolean;
            withdrawalIds: bigint[];
            validatorIds: bigint[];
        }[];
        shares: BigNumber;
        assets: BigNumber;
        vaultId: string;
        type: "withdraw";
    }>;
    protected erc20TokenFormatter(result: bigint, token: TokenEntity): TokenBalance;
    protected nativeTokenFormatter(result: bigint, token: TokenNative): TokenBalance;
    protected govVaultFormatter(state: BeefyState, result: GovVaultSingleBalanceContractData, govVault: VaultGovSingle): GovVaultBalance;
    protected boostFormatter(state: BeefyState, result: BoostBalanceContractData, boost: BoostPromoEntity): BoostBalance;
    protected govVaultV2Formatter(state: BeefyState, result: GovVaultMultiBalanceContractData, govVault: VaultGovMulti | VaultGovCowcentrated): GovVaultBalance;
    protected boostV2Formatter(state: BeefyState, result: GovVaultMultiBalanceContractData, boost: BoostPromoEntity): BoostBalance;
}
