import type {
  QuoteOutputTokenAmountChange,
  TransactOption,
  TransactQuote,
} from '../../apis/transact/transact-types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { VaultEntity } from '../../entities/vault';
import type { TokenEntity } from '../../entities/token';
import type { ChainEntity } from '../../entities/chain';
import type { BigNumber } from 'bignumber.js';

export enum TransactStep {
  Loading,
  Form,
  TokenSelect,
  QuoteSelect,
}

export enum TransactMode {
  Deposit,
  Withdraw,
}

export enum TransactStatus {
  Idle,
  Pending,
  Rejected,
  Fulfilled,
}

export type TransactTokens = {
  allTokensIds: string[];
  byTokensId: Record<TransactOption['tokensId'], TokenEntity['address'][]>;
  allChainIds: ChainEntity['id'][];
  byChainId: Record<ChainEntity['id'], TransactOption['tokensId'][]>;
};

export type TransactOptions = {
  vaultId: VaultEntity['id'];
  mode: TransactMode;
  status: TransactStatus;
  error: SerializedError;
  requestId: string | null;
  allOptionIds: TransactOption['id'][];
  byOptionId: Record<TransactOption['id'], TransactOption>;
  byTokensId: Record<TransactOption['tokensId'], TransactOption['id'][]>;
};

export type TransactQuotes = {
  allQuoteIds: string[];
  byQuoteId: Record<TransactQuote['optionId'], TransactQuote>;
  status: TransactStatus;
  requestId: string;
  error: SerializedError | null;
};

export type TransactConfirm = {
  changes: QuoteOutputTokenAmountChange[];
  status: TransactStatus;
  requestId: string | null;
  error: SerializedError | null;
};

export type TransactState = {
  vaultId: VaultEntity['id'] | null;
  selectedChainId: string | null;
  selectedTokensId: string | null;
  selectedQuoteId: string | null;
  swapSlippage: number;
  inputAmount: BigNumber;
  inputMax: boolean;
  mode: TransactMode;
  step: TransactStep;
  tokens: TransactTokens;
  options: TransactOptions;
  quotes: TransactQuotes;
  migrateQuotes: TransactQuotes;
  confirm: TransactConfirm;
};
