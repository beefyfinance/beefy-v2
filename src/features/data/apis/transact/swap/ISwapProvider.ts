import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { ZapFee } from '../transact-types.ts';

export type QuoteRequest = {
  fromToken: TokenEntity;
  fromAmount: BigNumber;
  toToken: TokenEntity;
  vaultId: VaultEntity['id']; // so we can block vaults from aggregators if needed
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
  getSupportedTokens(
    vaultId: VaultEntity['id'],
    chainId: ChainEntity['id'],
    state: BeefyState
  ): Promise<TokenEntity[]>;
  getSupportedChains(state: BeefyState): Promise<ChainEntity['id'][]>;
  fetchQuote(request: QuoteRequest, state: BeefyState): Promise<QuoteResponse>;
  fetchSwap(request: SwapRequest, state: BeefyState): Promise<SwapResponse>;
}
