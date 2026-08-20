import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenEntity } from '../../../entities/token';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyState } from '../../../store/types';
import type { ZapFee } from '../transact-types';
export type QuoteRequest = {
    fromToken: TokenEntity;
    fromAmount: BigNumber;
    toToken: TokenEntity;
    vaultId?: VaultEntity['id'];
};
export type QuoteResponse<T = unknown> = {
    providerId: string;
    fromToken: TokenEntity;
    fromAmount: BigNumber;
    toToken: TokenEntity;
    toAmount: BigNumber;
    fee: ZapFee;
    extra?: T;
};
export type SwapRequest<T = unknown> = {
    quote: QuoteResponse<T>;
    fromAddress: string;
    slippage: number;
};
export type SwapTx = {
    fromAddress: string;
    toAddress: string;
    data: string;
    value: string;
    inputPosition: number;
};
export type SwapResponse = {
    providerId: string;
    fromToken: TokenEntity;
    fromAmount: BigNumber;
    toToken: TokenEntity;
    toAmount: BigNumber;
    toAmountMin: BigNumber;
    tx: SwapTx;
    fee: ZapFee;
};
export interface ISwapProvider {
    getId(): string;
    getSupportedTokens(vaultId: VaultEntity['id'] | undefined, chainId: ChainEntity['id'], state: BeefyState): Promise<TokenEntity[]>;
    getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
    fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse>;
    fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse>;
}
