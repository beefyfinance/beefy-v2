/**
 * DEV-only cross-chain scenario simulator — shared state seeders.
 *
 * These helpers dispatch PLAIN Redux actions to force the Stepper / recovery UI
 * into an exact visual state without any wallet, transaction, or CCTP bridge, so
 * every cross-chain scenario can be screenshotted (including ones that are hard
 * or impossible to reproduce live). Nothing here runs in production — the whole
 * module is only imported behind `import.meta.env.DEV`.
 */
import BigNumber from 'bignumber.js';
import { fetchBalanceAction } from '../../features/data/actions/balance.ts';
import { transactSwitchMode } from '../../features/data/actions/transact.ts';
import {
  crossChainClearRecoveryQuote,
  crossChainOpDismiss,
  crossChainOpInitiated,
  crossChainSeedRecoveryQuote,
} from '../../features/data/actions/wallet/cross-chain.ts';
import {
  stepperReset,
  stepperSetBridgeStatus,
  stepperSetStepContent,
  stepperStartWithSteps,
} from '../../features/data/actions/wallet/stepper.ts';
import {
  createWalletActionErrorAction,
  createWalletActionResetAction,
} from '../../features/data/actions/wallet/wallet-action.ts';
import type { RecoveryQuote } from '../../features/data/apis/transact/transact-types.ts';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import type {
  BridgeStatus,
  DstTokenReturned,
  Step,
  StepContent,
} from '../../features/data/reducers/wallet/stepper-types.ts';
import {
  type CrossChainRecoveryVault,
  type PendingCrossChainOp,
  TransactMode,
} from '../../features/data/reducers/wallet/transact-types.ts';
import {
  userDidConnect,
  walletHasDisconnected,
} from '../../features/data/reducers/wallet/wallet.ts';
import type { BeefyDispatchFn, BeefyState } from '../../features/data/store/types.ts';

export const DEV_OP_ID = 'dev-sim-op';
/** Deterministic demo wallet address (lowercase — balance state keys are lowercased). */
export const DEMO_ADDR = '0xbeef00000000000000000000000000000000beef';

export type SimMode = 'deposit' | 'withdraw';

export type SimCtx = {
  dispatch: BeefyDispatchFn;
  getState: () => BeefyState;
  vault: VaultEntity;
  mode: SimMode;
  sourceChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  /** USDC on the destination (= vault) chain. */
  destUsdc: TokenEntity;
  /** The vault's deposit token (always loaded for the page vault). */
  vaultDepositToken: TokenEntity;
  destNativeToken: TokenEntity;
  /** USDC address on the source chain (for source-dust presets; 6 decimals). */
  sourceUsdcAddress: string;
};

/** Convert a human amount to a raw-wei string for the token decimals. */
export function toWei(human: string, decimals: number): string {
  return new BigNumber(human).shiftedBy(decimals).toFixed(0);
}

/** Clean slate: closed modal, cleared wallet action + recovery quote, dropped sim op. */
export function resetAll(ctx: SimCtx): void {
  ctx.dispatch(stepperReset());
  ctx.dispatch(crossChainOpDismiss({ id: DEV_OP_ID }));
  ctx.dispatch(crossChainClearRecoveryQuote());
  ctx.dispatch(createWalletActionResetAction());
}

export function connect(ctx: SimCtx, chainId: ChainEntity['id']): void {
  ctx.dispatch(userDidConnect({ chainId, address: DEMO_ADDR }));
}

export function disconnect(ctx: SimCtx): void {
  ctx.dispatch(walletHasDisconnected());
}

export function switchMode(ctx: SimCtx): void {
  ctx.dispatch(
    transactSwitchMode(ctx.mode === 'deposit' ? TransactMode.Deposit : TransactMode.Withdraw)
  );
}

/** Open the stepper modal with the given items (empty = no auto-dispatch). */
export function openStepper(ctx: SimCtx, items: Step[] = []): void {
  ctx.dispatch(stepperStartWithSteps(items, ctx.destChainId));
}

export function setContent(ctx: SimCtx, content: StepContent): void {
  ctx.dispatch(stepperSetStepContent({ stepContent: content }));
}

export function setBridge(ctx: SimCtx, partial: Partial<BridgeStatus>): void {
  ctx.dispatch(stepperSetBridgeStatus(partial));
}

/** Base bridge status linking the stepper to the seeded pending op. */
export function baseBridge(ctx: SimCtx): Partial<BridgeStatus> {
  return {
    opId: DEV_OP_ID,
    srcChainId: ctx.sourceChainId,
    srcTxHash: '0x' + '11'.repeat(32),
    destChainId: ctx.destChainId,
    vaultId: ctx.vault.id,
  };
}

/** A no-op step whose `pending:true` blocks the Stepper auto-dispatch effect. */
export function successItem(ctx: SimCtx): Step {
  return {
    step: ctx.mode === 'deposit' ? 'zap-in' : 'zap-out',
    message: '',
    action: (() => {}) as unknown as Step['action'],
    pending: true,
    extraInfo: {
      vaultId: ctx.vault.id,
      zap: true,
      crossChain: { sourceChainId: ctx.sourceChainId, destChainId: ctx.destChainId },
    },
  };
}

/** Seed a dest-failed pending cross-chain op (recovery target = the page vault). */
export function seedOp(ctx: SimCtx, overrides: Partial<PendingCrossChainOp> = {}): void {
  const recovery: CrossChainRecoveryVault = {
    destHandlerKind: 'vault',
    destChainId: ctx.destChainId,
    destVaultId: ctx.vault.id,
    bridgeTokenAddress: ctx.destUsdc.address,
    bridgedAmount: '10',
  };
  const now = Date.now();
  const op: PendingCrossChainOp = {
    id: DEV_OP_ID,
    status: 'dest-failed',
    direction: ctx.mode,
    sourceChainId: ctx.sourceChainId,
    destChainId: ctx.destChainId,
    vaultId: ctx.vault.id,
    sourceTxHash: '0x' + '11'.repeat(32),
    sourceInput: {
      token: ctx.mode === 'deposit' ? ctx.destUsdc : ctx.vaultDepositToken,
      amount: new BigNumber('10'),
    },
    expectedOutput: {
      token: ctx.mode === 'deposit' ? ctx.vaultDepositToken : ctx.destUsdc,
      amount: new BigNumber('9.98'),
    },
    sourceDisplaySteps: [],
    destDisplaySteps: [],
    recovery,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  ctx.dispatch(crossChainOpInitiated(op));
}

/** Inject a fulfilled recovery quote for the sim op (DEV-only action). */
export function seedRecoveryQuote(ctx: SimCtx): void {
  const quote: RecoveryQuote = {
    id: 'dev-recovery-quote',
    inputs: [{ token: ctx.destUsdc, amount: new BigNumber('10'), max: false }],
    outputs: [{ token: ctx.vaultDepositToken, amount: new BigNumber('9.98') }],
    returned: [],
    steps: [],
    priceImpact: 0,
    fee: { value: 0 },
    allowances: [],
    // Never read by the recovery UI; a placeholder is fine.
    destHandlerQuote: {} as RecoveryQuote['destHandlerQuote'],
  };
  ctx.dispatch(crossChainSeedRecoveryQuote({ opId: DEV_OP_ID, quote }));
}

/** Give the demo wallet a nonzero native balance so `hasNoGas` is false. */
export function seedGas(ctx: SimCtx, chainId: ChainEntity['id'], token: TokenEntity): void {
  ctx.dispatch(
    fetchBalanceAction.fulfilled(
      {
        chainId,
        walletAddress: DEMO_ADDR,
        data: {
          tokens: [{ tokenAddress: token.address, amount: new BigNumber('1') }],
          govVaults: [],
          boosts: [],
          erc4626Pending: [],
        },
        state: ctx.getState(),
      },
      'dev-sim-balance',
      { chainId }
    )
  );
}

export function errorState(ctx: SimCtx, message: string, friendlyMessage?: string): void {
  ctx.dispatch(createWalletActionErrorAction({ message, friendlyMessage }, undefined));
}

/** Build a raw-wei token-returned entry for dst/src dust seeding. */
export function returned(token: TokenEntity, human: string): DstTokenReturned {
  return { tokenAddress: token.address, amount: toWei(human, token.decimals) };
}

/** Same, keyed by a bare address (used for source-chain dust where we have no entity). */
export function returnedAddr(
  tokenAddress: string,
  human: string,
  decimals: number
): DstTokenReturned {
  return { tokenAddress, amount: toWei(human, decimals) };
}
