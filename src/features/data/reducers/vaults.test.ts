import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { fetchClmFeesAction } from '../actions/clm-fees.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import { initialVaultsState, vaultsSlice } from './vaults.ts';

const applyFees = (
  state: typeof initialVaultsState,
  payload: ReturnType<typeof fetchClmFeesAction.fulfilled>['payload']
) =>
  vaultsSlice.reducer(state, fetchClmFeesAction.fulfilled(payload, 'req-id', { chainId: 'base' }));

describe('vaultsSlice fetchClmFeesAction', () => {
  it('keeps the last known fee when a read fails and marks the chain once bounds are loaded', () => {
    let state = applyFees(initialVaultsState, {
      chainId: 'base',
      fees: [{ id: 'clm', swapFee: 0.003, range: { min: 0.001, max: 0.01 } }],
      rangesLoaded: true,
    });
    state = applyFees(state, {
      chainId: 'base',
      fees: [{ id: 'clm', swapFee: undefined }],
      rangesLoaded: true,
    });

    expect(state.clmFees.byVaultId['clm']).toEqual({
      swapFee: 0.003,
      range: { min: 0.001, max: 0.01 },
    });
    expect(state.clmFees.rangesLoadedByChainId).toEqual({ base: true });
  });

  it('does not break contract data that lands after the fees', () => {
    const balances = [new BigNumber(1), new BigNumber(2)];
    let state = applyFees(initialVaultsState, {
      chainId: 'base',
      fees: [{ id: 'clm', swapFee: 0.003 }],
      rangesLoaded: false,
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
    expect(state.clmFees.rangesLoadedByChainId).toEqual({});
  });
});
