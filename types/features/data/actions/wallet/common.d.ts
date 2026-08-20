import type { Address } from 'viem';
import { type Chain, type Hash, type PublicClient } from 'viem';
import type { GasPricing } from '../../apis/gas-prices/gas-prices';
import type { ChainEntity } from '../../entities/chain';
import type { MinterEntity } from '../../entities/minter';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity } from '../../entities/token';
import { type VaultEntity } from '../../entities/vault';
import { type TxAdditionalData } from '../../reducers/wallet/wallet-action-types';
import type { BeefyDispatchFn, BeefyState, BeefyThunk } from '../../store/types';
type TxRefreshOnSuccess = {
    walletAddress: string;
    chainId: ChainEntity['id'];
    spenderAddress: string;
    tokens: TokenEntity[];
    govVaultId?: VaultEntity['id'];
    boostId?: BoostPromoEntity['id'];
    minterId?: MinterEntity['id'];
    vaultId?: VaultEntity['id'];
    migrationId?: string;
    rewards?: boolean;
    clearInput?: boolean;
};
export type TxWriteProps = {
    account: Address;
    chain: Chain | undefined;
} & GasPricing;
/**
 * Called before building a transaction
 */
export declare function txStart(dispatch: BeefyDispatchFn): void;
/**
 * Must call just before calling .send() on a transaction
 */
export declare function txWallet(dispatch: BeefyDispatchFn): void;
export declare const resetWallet: () => BeefyThunk;
export declare function captureWalletErrors<T extends BeefyThunk>(func: T): BeefyThunk;
export declare function bindTransactionEvents(dispatch: BeefyDispatchFn, transactionHashPromise: Promise<Hash>, client: PublicClient, additionalData: TxAdditionalData, refreshOnSuccess?: TxRefreshOnSuccess): void;
export declare function sendTransaction(dispatch: BeefyDispatchFn, builder: () => Promise<Hash>, client: PublicClient, additionalData: TxAdditionalData, refreshOnSuccess?: TxRefreshOnSuccess): void;
export declare function selectVaultTokensToRefresh(state: BeefyState, vault: VaultEntity): TokenEntity[];
export {};
