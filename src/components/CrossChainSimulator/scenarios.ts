/**
 * DEV-only cross-chain scenario presets.
 *
 * Each preset composes a deterministic Redux state (via the seed helpers) that
 * forces the Stepper modal or the vault-page ActionRecovery into one exact
 * visual state, for screenshotting. No wallet / tx / bridge is involved.
 *
 * Note: some visuals are driven by the CURRENTLY OPEN vault, not the preset —
 * e.g. the deposit "received" symbol shows the deposit-token symbol for
 * single-asset vaults and "LP" for lps/clm vaults. Open the relevant vault type
 * to capture each look.
 */
import { transactSetSuccessClosed } from '../../features/data/actions/transact.ts';
import { StepContent } from '../../features/data/reducers/wallet/stepper-types.ts';
import {
  baseBridge,
  connect,
  disconnect,
  errorState,
  openStepper,
  resetAll,
  returned,
  returnedAddr,
  seedGas,
  seedOp,
  seedRecoveryQuote,
  setBridge,
  setContent,
  type SimCtx,
  type SimMode,
  successItem,
  switchMode,
  toWei,
} from './seed.ts';

export type Scenario = {
  id: string;
  label: string;
  group: string;
  apply: (ctx: SimCtx) => void;
};

function withMode(ctx: SimCtx, mode: SimMode): SimCtx {
  return { ...ctx, mode };
}

// --- shared builders -------------------------------------------------------

/** Open the stepper in BridgingTx for the given direction. */
function bridging(ctx: SimCtx, mode: SimMode): void {
  const c = withMode(ctx, mode);
  resetAll(c);
  switchMode(c);
  openStepper(c, []);
  setContent(c, StepContent.BridgingTx);
}

/** Open the stepper in SuccessTx with the given returned tokens. */
function success(
  ctx: SimCtx,
  mode: SimMode,
  opts: { dstReceived?: boolean; dstDust?: boolean; srcDust?: boolean } = {}
): void {
  const c = withMode(ctx, mode);
  const { dstReceived = true, dstDust = false, srcDust = false } = opts;
  resetAll(c);
  switchMode(c);
  seedOp(c);
  openStepper(c, [successItem(c)]);
  setContent(c, StepContent.SuccessTx);

  const dst = [];
  if (dstReceived) {
    // Received: use an address in the "received" set so it renders as received.
    dst.push(
      mode === 'deposit' ? returned(c.vaultDepositToken, '9.98') : returned(c.destUsdc, '9.98')
    );
  }
  if (dstDust) {
    // Dust: a token NOT in the received set.
    dst.push(
      mode === 'deposit' ? returned(c.destUsdc, '0.0025') : returned(c.vaultDepositToken, '0.01')
    );
  }
  const src = srcDust ? [returnedAddr(c.sourceUsdcAddress, '0.15', 6)] : [];

  setBridge(c, {
    ...baseBridge(c),
    dstTxHash: '0x' + '22'.repeat(32),
    dstTokensReturned: dst,
    srcTokensReturned: src,
  });
}

/** Open the stepper in ErrorTx with a friendly + raw message. */
function error(ctx: SimCtx, mode: SimMode, friendly: string, raw: string): void {
  const c = withMode(ctx, mode);
  resetAll(c);
  switchMode(c);
  openStepper(c, []);
  setContent(c, StepContent.ErrorTx);
  errorState(c, raw, friendly);
}

type RecoveryOpts = {
  onDestChain?: boolean; // connected to dest (true) vs source (false)
  connected?: boolean; // wallet connected at all
  hasQuote?: boolean; // valid recovery quote seeded
  hasGas?: boolean; // nonzero native gas on dest
  lifecycle?: 'abandoned' | 'confirmed';
  refund?: boolean; // dstRefundedAmount set
  walletError?: boolean; // show retry + close
};

/** Open the stepper in RecoveryTx for the given direction + sub-state. */
function recovery(ctx: SimCtx, mode: SimMode, opts: RecoveryOpts): void {
  const c = withMode(ctx, mode);
  const {
    onDestChain = true,
    connected = true,
    hasQuote = false,
    hasGas = false,
    lifecycle,
    refund = false,
    walletError = false,
  } = opts;

  resetAll(c);
  switchMode(c);
  if (connected) {
    connect(c, onDestChain ? c.destChainId : c.sourceChainId);
  } else {
    disconnect(c);
  }
  seedOp(c);
  openStepper(c, [successItem(c)]);
  setContent(c, StepContent.RecoveryTx);
  setBridge(c, {
    ...baseBridge(c),
    ...(lifecycle ? { lifecycleState: lifecycle } : {}),
    dstRefundedAmount: refund ? toWei('10', 6) : '0',
  });
  if (hasQuote) {
    seedRecoveryQuote(c);
  }
  if (hasGas) {
    seedGas(c, c.destChainId, c.destNativeToken);
  }
  if (walletError) {
    errorState(
      c,
      'The finalise transaction failed. Fetch a new quote and try again.',
      'execution reverted'
    );
  }
}

/** Seed a page-level (modal-closed) recovery op so ActionRecovery renders inline. */
function pageRecovery(ctx: SimCtx, opts: RecoveryOpts & { complete?: boolean }): void {
  const c = withMode(ctx, 'deposit');
  const {
    onDestChain = true,
    connected = true,
    hasQuote = false,
    hasGas = false,
    lifecycle,
    complete = false,
  } = opts;

  resetAll(c);
  switchMode(c);
  if (connected) {
    connect(c, onDestChain ? c.destChainId : c.sourceChainId);
  } else {
    disconnect(c);
  }
  seedOp(c);
  setBridge(c, {
    ...baseBridge(c),
    ...(lifecycle ? { lifecycleState: lifecycle } : {}),
    dstRefundedAmount: '0',
  });
  if (hasQuote) {
    seedRecoveryQuote(c);
  }
  if (hasGas) {
    seedGas(c, c.destChainId, c.destNativeToken);
  }
  if (complete) {
    c.dispatch(transactSetSuccessClosed(true));
  }
}

// --- preset catalog --------------------------------------------------------

export const SCENARIOS: Scenario[] = [
  // Deposit (modal)
  {
    id: 'deposit-bridging',
    label: 'Bridging',
    group: 'Deposit',
    apply: c => bridging(c, 'deposit'),
  },
  {
    id: 'deposit-success',
    label: 'Success (received)',
    group: 'Deposit',
    apply: c => success(c, 'deposit'),
  },
  {
    id: 'deposit-success-dstdust',
    label: 'Success + dest dust',
    group: 'Deposit',
    apply: c => success(c, 'deposit', { dstDust: true }),
  },
  {
    id: 'deposit-success-srcdust',
    label: 'Success + source dust',
    group: 'Deposit',
    apply: c => success(c, 'deposit', { srcDust: true }),
  },
  {
    id: 'deposit-success-bothdust',
    label: 'Success + both dust',
    group: 'Deposit',
    apply: c => success(c, 'deposit', { dstDust: true, srcDust: true }),
  },
  {
    id: 'deposit-error',
    label: 'Error (below fee)',
    group: 'Deposit',
    apply: c =>
      error(
        c,
        'deposit',
        'The amount is too low to cover the bridge fee.',
        'CrossChainBridgeBelowFeeError: input 10 USDC does not cover the bridge fee 5.01 USDC'
      ),
  },

  // Withdraw (modal)
  {
    id: 'withdraw-bridging',
    label: 'Bridging',
    group: 'Withdraw',
    apply: c => bridging(c, 'withdraw'),
  },
  {
    id: 'withdraw-success',
    label: 'Success (received)',
    group: 'Withdraw',
    apply: c => success(c, 'withdraw'),
  },
  {
    id: 'withdraw-success-dstdust',
    label: 'Success + dest dust',
    group: 'Withdraw',
    apply: c => success(c, 'withdraw', { dstDust: true }),
  },
  {
    id: 'withdraw-error',
    label: 'Error',
    group: 'Withdraw',
    apply: c => error(c, 'withdraw', 'Something went wrong.', 'execution reverted: STF'),
  },

  // Recovery (stepper modal)
  {
    id: 'recovery-deposit-fetchquote',
    label: 'Fetch quote (gas)',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { hasGas: true }),
  },
  {
    id: 'recovery-deposit-fetchquote-nogas',
    label: 'Fetch quote (no gas)',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { hasGas: false }),
  },
  {
    id: 'recovery-deposit-wrongchain',
    label: 'Wrong chain',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { onDestChain: false, hasGas: true }),
  },
  {
    id: 'recovery-deposit-finalise',
    label: 'Finalise (gas)',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { hasQuote: true, hasGas: true }),
  },
  {
    id: 'recovery-deposit-finalise-nogas',
    label: 'Finalise (no gas)',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { hasQuote: true, hasGas: false }),
  },
  {
    id: 'recovery-deposit-abandoned',
    label: 'Abandoned / unknown',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { lifecycle: 'abandoned' }),
  },
  {
    id: 'recovery-deposit-refund',
    label: 'Refund shown',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { lifecycle: 'confirmed', refund: true, hasGas: true }),
  },
  {
    id: 'recovery-deposit-notconnected',
    label: 'Not connected',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { connected: false }),
  },
  {
    id: 'recovery-deposit-error',
    label: 'Finalise failed (retry)',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'deposit', { hasGas: true, walletError: true }),
  },
  {
    id: 'recovery-withdraw-fetchquote',
    label: 'Withdraw fetch quote',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'withdraw', { hasGas: true }),
  },
  {
    id: 'recovery-withdraw-finalise',
    label: 'Withdraw finalise',
    group: 'Recovery (modal)',
    apply: c => recovery(c, 'withdraw', { hasQuote: true, hasGas: true }),
  },

  // Recovery (vault page, modal closed)
  {
    id: 'page-recovery-fetchquote',
    label: 'Fetch new quote',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { hasGas: true }),
  },
  {
    id: 'page-recovery-finalise',
    label: 'Finalise',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { hasQuote: true, hasGas: true }),
  },
  {
    id: 'page-recovery-wrongchain',
    label: 'Wrong chain',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { onDestChain: false }),
  },
  {
    id: 'page-recovery-notconnected',
    label: 'Not connected',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { connected: false }),
  },
  {
    id: 'page-recovery-unknown',
    label: 'Unknown (in progress)',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { lifecycle: 'abandoned' }),
  },
  {
    id: 'page-recovery-complete',
    label: 'Complete (close)',
    group: 'Recovery (page)',
    apply: c => pageRecovery(c, { hasQuote: true, hasGas: true, complete: true }),
  },

  // Reset
  { id: 'reset', label: '— Reset —', group: 'Reset', apply: c => resetAll(c) },
];
