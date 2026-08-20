import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain';
import type { BoostPromoEntity } from '../../entities/promo';
import type { VaultCowcentrated, VaultErc4626, VaultGov, VaultGovMulti, VaultStandardBeefy, VaultStandardCowcentrated } from '../../entities/vault';
import type { BeefyState } from '../../store/types';
import type { BoostContractData, BoostRawContractData, CowVaultRawContractData, Erc4626VaultRawContractData, FetchAllContractDataEntities, FetchAllContractDataResult, GovVaultMultiContractData, GovVaultMultiRawContractData, GovVaultRawContractData, IContractDataApi, StandardVaultRawContractData } from './contract-data-types';
export declare class ContractDataAPI<T extends ChainEntity> implements IContractDataApi {
    protected chain: T;
    constructor(chain: T);
    fetchAllContractData(state: BeefyState, { standardVaults, erc4626Vaults, govVaults, govVaultsMulti, cowVaults, boosts, boostsMulti, }: FetchAllContractDataEntities): Promise<FetchAllContractDataResult>;
    protected standardVaultFormatter(state: BeefyState, result: StandardVaultRawContractData, standardVault: VaultStandardBeefy | VaultStandardCowcentrated): {
        id: string;
        balance: BigNumber;
        /** always 18 decimals for PPFS */
        pricePerFullShare: BigNumber;
        strategy: string;
        paused: boolean;
    };
    protected erc4626VaultFormatter(state: BeefyState, result: Erc4626VaultRawContractData, erc4626Vault: VaultErc4626): {
        id: string;
        balance: BigNumber;
        pricePerFullShare: BigNumber;
        paused: boolean;
    };
    protected govVaultFormatter(state: BeefyState, result: GovVaultRawContractData, govVault: VaultGov): {
        id: string;
        totalSupply: BigNumber;
    };
    protected govVaultMultiFormatter(state: BeefyState, result: GovVaultMultiRawContractData, govVault: VaultGovMulti): GovVaultMultiContractData;
    protected cowVaultFormatter(state: BeefyState, result: CowVaultRawContractData, cowVault: VaultCowcentrated): {
        id: string;
        balances: BigNumber[];
        strategy: `0x${string}`;
        paused: boolean;
    };
    protected boostFormatter(state: BeefyState, result: BoostRawContractData, boost: BoostPromoEntity): {
        id: string;
        periodFinish: Date | undefined;
        isPreStake: boolean;
        totalSupply: BigNumber;
        rewards: {
            token: Pick<import("../../entities/token").TokenErc20 | import("../../entities/token").TokenNative, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            rewardRate: BigNumber;
            periodFinish: Date | undefined;
            isPreStake: boolean;
            index: number;
        }[];
    };
    protected boostFormatterMulti(state: BeefyState, result: GovVaultMultiRawContractData, boost: BoostPromoEntity): BoostContractData;
    protected periodFinishToDate(periodFinish: string | null | undefined): Date | undefined;
}
