import { describe, expect, it } from 'vitest';
import {
  canQuoteForCurrentTarget,
  transactInit,
  transactFetchOptions,
  transactInitReady,
} from '../../actions/transact.ts';
import { TransactMode, TransactStatus, TransactStep } from './transact-types.ts';
import type { TransactState } from './transact-types.ts';
import type { TransactOption } from '../../apis/transact/transact-types.ts';
import { transactReducer } from './transact.ts';

/**
 * Both wrappers of one CLM build their options from the same underlying strategy, so the option
 * ids collide across the pair and only `vaultId` distinguishes them. That collision is what makes
 * a merge-instead-of-replace silently keep the wrapper the user just switched away from.
 */
function option(vaultId: string): TransactOption {
  return {
    id: 'shared-option-id',
    vaultId,
    chainId: 'base',
    selectionId: 'shared-selection-id',
    selectionOrder: 1,
    mode: TransactMode.Deposit,
    strategyId: vaultId === 'clm-pool' ? 'gov-composer' : 'vault-composer',
    vaultType: 'standard',
    inputs: [],
    wantedOutputs: [],
  } as unknown as TransactOption;
}

/** drive the reducer to the state of a loaded deposit form for `vaultId` */
function loadedFor(vaultId: string) {
  let state = transactReducer(undefined, transactInit({ vaultId }));
  state = transactReducer(state, transactInitReady({ vaultId, mode: TransactMode.Deposit }));
  const pending = transactFetchOptions.pending('req-1', {
    vaultId,
    mode: TransactMode.Deposit,
  });
  state = transactReducer(state, pending);
  return transactReducer(
    state,
    transactFetchOptions.fulfilled(
      { options: [option(vaultId)], walletAddress: undefined },
      'req-1',
      { vaultId, mode: TransactMode.Deposit }
    )
  );
}

describe('transact retarget between CLM wrappers', () => {
  it('keeps the loaded options so the form does not blank', () => {
    const loaded = loadedFor('clm-pool');
    expect(loaded.options.status).toBe(TransactStatus.Fulfilled);

    const retargeted = transactReducer(
      loaded,
      transactInit({ vaultId: 'clm-vault', mode: TransactMode.Deposit, retarget: true })
    );

    expect(retargeted.options.status).toBe(TransactStatus.Fulfilled);
    expect(retargeted.options.allOptionIds).toEqual(['shared-option-id']);
    expect(retargeted.step).toBe(TransactStep.Form);
    // the form stays rendered, but the quote it could act on is gone
    expect(retargeted.quotes.allQuoteIds).toEqual([]);
  });

  it('blanks as before on a cold load, which has nothing to keep', () => {
    const cold = transactReducer(undefined, transactInit({ vaultId: 'clm-pool', retarget: true }));

    expect(cold.options.status).toBe(TransactStatus.Idle);
    expect(cold.step).toBe(TransactStep.Loading);
    expect(cold.vaultId).toBeUndefined();
  });

  it('replaces colliding options rather than keeping the old vault id', () => {
    const loaded = loadedFor('clm-pool');
    const retargeted = transactReducer(
      loaded,
      transactInit({ vaultId: 'clm-vault', mode: TransactMode.Deposit, retarget: true })
    );
    const ready = transactReducer(
      retargeted,
      transactInitReady({ vaultId: 'clm-vault', mode: TransactMode.Deposit })
    );
    const pending = transactReducer(
      ready,
      transactFetchOptions.pending('req-2', { vaultId: 'clm-vault', mode: TransactMode.Deposit })
    );
    // the refetch must not blank what is on screen
    expect(pending.options.status).toBe(TransactStatus.Fulfilled);

    const fulfilled = transactReducer(
      pending,
      transactFetchOptions.fulfilled(
        { options: [option('clm-vault')], walletAddress: undefined },
        'req-2',
        { vaultId: 'clm-vault', mode: TransactMode.Deposit }
      )
    );

    expect(fulfilled.options.allOptionIds).toEqual(['shared-option-id']);
    expect(fulfilled.options.byOptionId['shared-option-id'].vaultId).toBe('clm-vault');
  });

  it('does not strand the abandoned id when toggled back mid-switch', () => {
    const loaded = loadedFor('clm-pool');
    const away = transactReducer(
      loaded,
      transactInit({ vaultId: 'clm-vault', mode: TransactMode.Deposit, retarget: true })
    );
    expect(away.pendingVaultId).toBe('clm-vault');

    // toggled back before the first switch resolved
    const back = transactReducer(
      away,
      transactInit({ vaultId: 'clm-pool', mode: TransactMode.Deposit, retarget: true })
    );

    // otherwise the in-flight listener for clm-vault would land the store on the wrong wrapper
    expect(back.pendingVaultId).toBeUndefined();
    expect(back.vaultId).toBe('clm-pool');
  });
});

/**
 * The transaction target is a snapshot inside the quote (`quote.option.vaultId`), so this predicate
 * is the only thing stopping a deposit landing in the wrapper the user just switched away from.
 */
describe('canQuoteForCurrentTarget', () => {
  function stateWith(options: TransactOption[], overrides: Partial<TransactState> = {}) {
    return {
      vaultId: 'clm-pool',
      pendingVaultId: undefined,
      selectedSelectionId: 'sel',
      options: {
        bySelectionId: { sel: options.map(o => o.id) },
        byOptionId: Object.fromEntries(options.map(o => [o.id, o])),
      },
      ...overrides,
    } as unknown as TransactState;
  }

  it('allows quoting once the options name the vault we are on', () => {
    expect(canQuoteForCurrentTarget(stateWith([option('clm-pool')]))).toBe(true);
  });

  it('blocks while a retarget is in flight', () => {
    expect(
      canQuoteForCurrentTarget(stateWith([option('clm-pool')], { pendingVaultId: 'clm-vault' }))
    ).toBe(false);
  });

  it('blocks while the options still describe the wrapper we left', () => {
    // transactFetchOptions.pending has advanced options.vaultId but byOptionId is still the old set
    expect(canQuoteForCurrentTarget(stateWith([option('clm-vault')]))).toBe(false);
  });

  it('allows migrate, whose options target the replacement vault by design', () => {
    const migrateOption = {
      ...option('clm-replacement'),
      id: 'migrate-option-id',
      strategyId: 'vault-to-vault-single-token',
      mode: TransactMode.Deposit,
    } as unknown as TransactOption;

    expect(canQuoteForCurrentTarget(stateWith([migrateOption]))).toBe(true);
  });
});
