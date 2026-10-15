import { describe, expect, it } from 'vitest';
import locale from '../../../../locales/en/main.json';
import { PAUSE_REASONS, RETIRE_REASONS } from '../../../data/entities/vault.ts';
import { getRetirePauseReasonKeys, type RetirePauseReasonTarget } from './reason-keys.ts';

const target = (overrides: Partial<RetirePauseReasonTarget>): RetirePauseReasonTarget => ({
  status: 'eol',
  reason: undefined,
  holding: 'single',
  hasReplacement: false,
  ...overrides,
});

describe('getRetirePauseReasonKeys', () => {
  it('falls back to the status sentence when there is no reason', () => {
    expect(getRetirePauseReasonKeys(target({ status: 'paused' }))).toEqual(['Vault-Status-paused']);
  });

  it('orders status, cause, panic, move', () => {
    expect(
      getRetirePauseReasonKeys(
        target({ reason: 'liquidityPanic', holding: 'lp', hasReplacement: true })
      )
    ).toEqual([
      'Vault-Status-eol',
      ['Vault-Reason-liquidity-eol', 'Vault-Reason-liquidity'],
      'Vault-Reason-panic-lp',
      'Vault-Reason-move',
    ]);
  });

  it('adds no panic sentence for NoPanic codes', () => {
    expect(getRetirePauseReasonKeys(target({ reason: 'exploitNoPanic' }))).toEqual([
      'Vault-Status-eol',
      ['Vault-Reason-exploit-eol', 'Vault-Reason-exploit'],
    ]);
  });

  it('shows specific reasons without move or panic sentences', () => {
    expect(
      getRetirePauseReasonKeys(target({ reason: 'AerodromeMigration26', hasReplacement: true }))
    ).toEqual([
      'Vault-Status-eol',
      ['Vault-Reason-AerodromeMigration26-eol', 'Vault-Reason-AerodromeMigration26'],
    ]);
  });

  it('only emits keys that exist in the locale', () => {
    const cases = [
      ...RETIRE_REASONS.map(reason => ({ status: 'eol' as const, reason })),
      ...PAUSE_REASONS.map(reason => ({ status: 'paused' as const, reason })),
    ];
    const missing = cases.flatMap(({ status, reason }) =>
      (['lp', 'single'] as const).flatMap(holding =>
        getRetirePauseReasonKeys({ status, reason, holding, hasReplacement: true })
          .map(key => (Array.isArray(key) ? key : [key]))
          .filter(options => !options.some(key => key in locale))
          .map(options => `${status}/${reason}: ${options.join(' | ')}`)
      )
    );
    expect(missing).toEqual([]);
  });
});
