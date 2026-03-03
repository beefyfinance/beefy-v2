import type {
  QuoteOutputTokenAmountChange,
  RecoveryQuote,
  TokenAmount,
  TransactOption,
  TransactQuote,
  ZapQuoteStep,
} from '../../apis/transact/transact-types.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type BigNumber from 'bignumber.js';
import type { SerializedError } from '../../apis/transact/strategies/error-types.ts';

export enum TransactStep {
  Loading,
  Form,
  TokenSelect,
  QuoteSelect,
}

export enum TransactMode {
  Deposit,
  Withdraw,
  Claim,
  Boost,
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
  hideIfZeroBalance: boolean;
};

export type TransactSelections = {
  allSelectionIds: string[];
  bySelectionId: Record<TransactOption['selectionId'], TransactSelection>;
  allChainIds: ChainEntity['id'][];
  byChainId: Partial<Record<ChainEntity['id'], TransactOption['selectionId'][]>>;
};

export type TransactOptions = {
  vaultId: VaultEntity['id'] | undefined;
  mode: TransactMode;
  status: TransactStatus;
  error: SerializedError | undefined;
  requestId: string | undefined;
  allOptionIds: TransactOption['id'][];
  byOptionId: Record<TransactOption['id'], TransactOption>;
  bySelectionId: Record<TransactOption['selectionId'], TransactOption['id'][]>;
};

export type TransactQuotes = {
  allQuoteIds: string[];
  byQuoteId: Record<TransactQuote['id'], TransactQuote>;
  status: TransactStatus;
  requestId: string | undefined;
  error: SerializedError | undefined;
};

export type TransactConfirm = {
  changes: QuoteOutputTokenAmountChange[];
  status: TransactStatus;
  requestId: string | undefined;
  error: SerializedError | undefined;
};

export type CrossChainOpStatus =
  | 'source-pending'
  | 'source-done'
  | 'dest-pending'
  | 'dest-done'
  | 'dest-failed'
  | 'dest-recovered';

export type CrossChainDepositRecoveryParams = {
  direction: 'deposit';
  destChainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  bridgeTokenAddress: string;
  bridgedAmount: string;
};

export type CrossChainWithdrawRecoveryParams = {
  direction: 'withdraw';
  destChainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  bridgeTokenAddress: string;
  bridgedAmount: string;
  desiredOutputAddress?: string;
};

export type CrossChainRecoveryParams =
  | CrossChainDepositRecoveryParams
  | CrossChainWithdrawRecoveryParams;

export type PendingCrossChainOp = {
  id: string;
  status: CrossChainOpStatus;
  direction: 'deposit' | 'withdraw';
  sourceChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  sourceTxHash: string;
  destTxHash?: string;
  sourceInput: TokenAmount;
  expectedOutput: TokenAmount;
  sourceDisplaySteps: ZapQuoteStep[];
  destDisplaySteps: ZapQuoteStep[];
  recovery: CrossChainRecoveryParams;
  createdAt: number;
  updatedAt: number;
};

export type CrossChainRecoveryQuoteState = {
  opId: string | undefined;
  quote: RecoveryQuote | undefined;
  status: TransactStatus;
  error: SerializedError | undefined;
};

export type TransactCrossChain = {
  pendingOps: Record<string, PendingCrossChainOp>;
  pendingOpIds: string[];
  recoveryQuote: CrossChainRecoveryQuoteState;
};

export type TransactState = {
  vaultId: VaultEntity['id'] | undefined;
  pendingVaultId: VaultEntity['id'] | undefined;
  selectedChainId: ChainEntity['id'] | undefined;
  selectedSelectionId: string | undefined;
  selectedQuoteId: string | undefined;
  swapSlippage: number;
  inputAmounts: BigNumber[];
  inputMaxes: boolean[];
  mode: TransactMode;
  step: TransactStep;
  forceSelection: boolean;
  selections: TransactSelections;
  options: TransactOptions;
  quotes: TransactQuotes;
  confirm: TransactConfirm;
  crossChain: TransactCrossChain;
};
