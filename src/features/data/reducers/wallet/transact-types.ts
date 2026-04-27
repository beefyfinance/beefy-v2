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
  ChainSelect,
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
  /**
   * For cross-chain vault-to-vault options: `src` vault id on deposit
   * selections, `dst` vault id on withdraw selections.
   */
  vaultRefId?: VaultEntity['id'];
  /** Denormalized so picker rows render a chain badge without a second selector lookup. */
  chainId?: ChainEntity['id'];
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
  | 'source-failed'
  | 'dest-pending'
  | 'dest-done'
  | 'dest-failed'
  | 'dest-recovered';

/**
 * Recovery params describe what the dst-chain "complete" action needs, not
 * how the original op was framed (deposit/withdraw, src handler). The
 * recovery dispatcher branches only on `destHandlerKind`; direction lives on
 * the wrapping `PendingCrossChainOp`.
 */

/** USDC was minted directly to the user on the dst chain. Retry attempts are no-ops. */
export type CrossChainRecoveryPassthrough = {
  destHandlerKind: 'passthrough';
  destChainId: ChainEntity['id'];
  bridgeTokenAddress: string;
  bridgedAmount: string;
};

/** Dst-chain aggregator swap from bridge token to `desiredOutputAddress`. */
export type CrossChainRecoverySwap = {
  destHandlerKind: 'swap';
  destChainId: ChainEntity['id'];
  bridgeTokenAddress: string;
  bridgedAmount: string;
  desiredOutputAddress: string;
};

/** Dst-chain deposit of bridge token into `destVaultId`. */
export type CrossChainRecoveryVault = {
  destHandlerKind: 'vault';
  destChainId: ChainEntity['id'];
  destVaultId: VaultEntity['id'];
  bridgeTokenAddress: string;
  bridgedAmount: string;
};

export type CrossChainRecoveryParams =
  | CrossChainRecoveryPassthrough
  | CrossChainRecoverySwap
  | CrossChainRecoveryVault;

export type PendingCrossChainOp = {
  id: string;
  status: CrossChainOpStatus;
  direction: 'deposit' | 'withdraw';
  sourceChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  /**
   * The vault page from which the op originated. Deposits: dst vault.
   * Withdraws: src vault. For vault-to-vault withdraws, the dst vault id
   * lives on `recovery` when `destHandlerKind === 'vault'`.
   */
  vaultId: VaultEntity['id'];
  sourceTxHash: string;
  destTxHash?: string;
  sourceInput: TokenAmount;
  expectedOutput: TokenAmount;
  sourceDisplaySteps: ZapQuoteStep[];
  destDisplaySteps: ZapQuoteStep[];
  recovery: CrossChainRecoveryParams;
  twoStep?: boolean;
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
  /** True while building steps / about to open stepper (disables deposit/withdraw/claim/recovery buttons) */
  executing: boolean;
  /** True after a successful tx when the stepper has been closed; keeps the route visible with finished steps */
  successClosed: boolean;
};
