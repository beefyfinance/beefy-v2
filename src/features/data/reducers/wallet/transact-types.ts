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

export type TransactSelection = {
  id: string;
  tokens: TokenEntity[];
  order: number;
};

export type TransactSelections = {
  allSelectionIds: string[];
  bySelectionId: Record<TransactOption['selectionId'], TransactSelection>;
  allChainIds: ChainEntity['id'][];
  byChainId: Record<ChainEntity['id'], TransactOption['selectionId'][]>;
};

export type TransactOptions = {
  vaultId: VaultEntity['id'];
  mode: TransactMode;
  status: TransactStatus;
  error: SerializedError;
  requestId: string | null;
  allOptionIds: TransactOption['id'][];
  byOptionId: Record<TransactOption['id'], TransactOption>;
  bySelectionId: Record<TransactOption['selectionId'], TransactOption['id'][]>;
};

export type TransactQuotes = {
  allQuoteIds: string[];
  byQuoteId: Record<TransactQuote['id'], TransactQuote>;
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
  selectedSelectionId: string | null;
  selectedQuoteId: string | null;
  swapSlippage: number;
  inputAmount: BigNumber;
  inputMax: boolean;
  mode: TransactMode;
  step: TransactStep;
  selections: TransactSelections;
  options: TransactOptions;
  quotes: TransactQuotes;
  migrateQuotes: TransactQuotes;
  confirm: TransactConfirm;
};
