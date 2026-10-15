import type { Namespace, TFunction } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import type { PendingCrossChainOp } from '../../reducers/wallet/transact-types.ts';
import { withBoostDetails, withRecoveryBoostDetails } from './boost-step-details.ts';

const t = ((key: string, options?: { type?: string }) =>
  options?.type ? `${key}(${options.type})` : key) as unknown as TFunction<Namespace>;

const zapIn: Step = {
  step: 'zap-in',
  message: 'test',
  action: () => undefined,
  pending: false,
  extraInfo: { zap: true, vaultId: 'test-vault' },
};
const zapOut: Step = { ...zapIn, step: 'zap-out' };

function makeOp(op: Record<string, unknown>): PendingCrossChainOp {
  return { sourceDisplaySteps: [], ...op } as unknown as PendingCrossChainOp;
}

describe('withBoostDetails', () => {
  it('names the stake and unstake in the wallet prompt and tags the step', () => {
    const deposit = withBoostDetails(zapIn, t, 'test-boost');
    const withdraw = withBoostDetails(zapOut, t, 'test-boost', true);

    expect(deposit.message).toBe('Vault-TxnConfirm(Deposit-Boost-noun)');
    expect(withdraw.message).toBe('Vault-TxnConfirm(Unstake-Withdraw-noun)');
    expect(deposit.extraInfo).toEqual({ ...zapIn.extraInfo, boostId: 'test-boost' });
    expect(withdraw.extraInfo?.boostClaimed).toBe(true);
  });

  it('leaves plain zaps alone', () => {
    expect(withBoostDetails(zapIn, t, undefined)).toBe(zapIn);
  });
});

describe('withRecoveryBoostDetails', () => {
  it('names the stake on a deposit recovery, which is the tx that stakes', () => {
    const op = makeOp({
      direction: 'deposit',
      recovery: { destHandlerKind: 'vault', boostId: 'test-boost' },
    });

    const step = withRecoveryBoostDetails(zapIn, op, t);

    expect(step.message).toBe('Vault-TxnConfirm(Deposit-Boost-noun)');
    expect(step.extraInfo?.boostId).toBe('test-boost');
  });

  it('keeps the prompt of a withdraw recovery, whose unstake already ran in the source tx', () => {
    const op = makeOp({
      direction: 'withdraw',
      recovery: { destHandlerKind: 'token' },
      sourceDisplaySteps: [{ type: 'unstake', boostId: 'test-boost', outputs: [] }],
    });

    const step = withRecoveryBoostDetails(zapOut, op, t);

    expect(step.message).toBe(zapOut.message);
    expect(step.extraInfo?.boostId).toBe('test-boost');
  });

  it('leaves recoveries of plain zaps alone', () => {
    const deposit = makeOp({ direction: 'deposit', recovery: { destHandlerKind: 'vault' } });
    const withdraw = makeOp({ direction: 'withdraw', recovery: { destHandlerKind: 'token' } });

    expect(withRecoveryBoostDetails(zapIn, deposit, t)).toBe(zapIn);
    expect(withRecoveryBoostDetails(zapOut, withdraw, t)).toBe(zapOut);
  });
});
