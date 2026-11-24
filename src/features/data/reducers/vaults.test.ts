import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { fetchClmFeesAction } from '../actions/clm-fees.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import { initialVaultsState, vaultsSlice } from './vaults.ts';

const applyFees = (
  state: typeof initialVaultsState,
  payload: ReturnType<typeof fetchClmFeesAction.fulfilled>['payload']
) => vaultsSlice.reducer(state, fetchClmFeesAction.fulfilled(payload, 'req-id'));

describe('vaultsSlice fetchClmFeesAction', () => {
  it('stores the fee, range and first swap fee from the api', () => {
    const state = applyFees(initialVaultsState, {
      byVaultId: {
        dynamic: { current: 0.003, dynamic: true, min: 0.001, max: 0.01, firstSwap: 0.0005 },
        fixed: { current: 0.0005, dynamic: false },
        managed: { current: 0.0024, dynamic: true },
      },
    });

    expect(state.clmFees.byVaultId).toEqual({
      dynamic: {
        swapFee: 0.003,
        isDynamic: true,
        range: { min: 0.001, max: 0.01 },
        firstSwapFee: 0.0005,
      },
      fixed: { swapFee: 0.0005, isDynamic: false, range: undefined, firstSwapFee: undefined },
      managed: { swapFee: 0.0024, isDynamic: true, range: undefined, firstSwapFee: undefined },
    });
  });

  it('keeps the same object when a poll returns the same fee', () => {
    const payload = {
      byVaultId: { clm: { current: 0.003, dynamic: true, min: 0.001, max: 0.01 } },
    };
    const first = applyFees(initialVaultsState, payload);
    const second = applyFees(first, payload);

    expect(second.clmFees.byVaultId['clm']).toBe(first.clmFees.byVaultId['clm']);
  });

  it('does not break contract data that lands after the fees', () => {
    const balances = [new BigNumber(1), new BigNumber(2)];
    let state = applyFees(initialVaultsState, {
      byVaultId: { clm: { current: 0.003, dynamic: false } },
    });
    state = vaultsSlice.reducer(
      state,
      fetchAllContractDataByChainAction.fulfilled(
        {
          chainId: 'base',
          contractData: {
            boosts: [],
            standardVaults: [],
            govVaults: [],
            govVaultsMulti: [],
            erc4626Vaults: [],
            cowVaults: [{ id: 'clm', balances, strategy: '0xstrategy' }],
          } as unknown as FetchAllContractDataResult,
        },
        'req-id',
        { chainId: 'base' }
      )
    );

    expect(state.contractData.byVaultId['clm']).toEqual({
      balances,
      strategyAddress: '0xstrategy',
    });
    expect(state.clmFees.byVaultId['clm']?.swapFee).toBe(0.003);
  });
});
