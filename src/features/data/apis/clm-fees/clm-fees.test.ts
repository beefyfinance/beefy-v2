import { describe, expect, it, vi } from 'vitest';
import type { ChainEntity } from '../../entities/chain.ts';
import type { VaultCowcentrated } from '../../entities/vault.ts';
import { ClmFeesApi, getAlgebraFeeRange, getDynamicFeeModuleRange } from './clm-fees.ts';

const { multicall } = vi.hoisted(() => ({ multicall: vi.fn() }));
vi.mock('../rpc-contract/rpc-manager.ts', () => ({
  rpcClientManager: { getSingleClient: () => ({ multicall }) },
}));

const HOOK_ZERO = 16_777_215n;
const MODULE_ZERO = 420n;

describe('getDynamicFeeModuleRange', () => {
  const moduleRange = (
    config: Parameters<typeof getDynamicFeeModuleRange>[0]['config'],
    overrides: Partial<Parameters<typeof getDynamicFeeModuleRange>[0]> = {}
  ) =>
    getDynamicFeeModuleRange({
      isHook: true,
      config,
      zeroFeeIndicator: HOOK_ZERO,
      defaultScalingFactor: 0n,
      defaultFeeCap: 50_000n,
      tierFee: 100,
      ...overrides,
    });

  it('spans base fee to cap when scaling (aero cbeth-weth)', () => {
    expect(moduleRange([60, 190, 3_000_000n, false, 0])).toEqual({ min: 0.00006, max: 0.00019 });
  });

  it('is fixed when neither the pool nor the defaults scale', () => {
    expect(moduleRange([2255, 0, 0n, false, 0])).toEqual({ min: 0.002255, max: 0.002255 });
  });

  it('uses the tick spacing fee for a zero base fee', () => {
    expect(moduleRange([0, 0, 0n], { tierFee: 10_000 })).toEqual({ min: 0.01, max: 0.01 });
  });

  it('treats ZERO_FEE_INDICATOR as the tier fee on hooks and as free on modules', () => {
    expect(moduleRange([Number(HOOK_ZERO), 0, 0n], { tierFee: 500 })).toEqual({
      min: 0.0005,
      max: 0.0005,
    });
    expect(
      moduleRange([Number(MODULE_ZERO), 0, 0n], { isHook: false, zeroFeeIndicator: MODULE_ZERO })
    ).toEqual({ min: 0, max: 0 });
  });

  it('includes the first-swap-in-block fee (aerodrome aero-cbbtc)', () => {
    expect(
      moduleRange([2700, 0, 0n, true, 750], {
        isHook: false,
        zeroFeeIndicator: MODULE_ZERO,
        defaultFeeCap: 30_000n,
      })
    ).toEqual({ min: 0.00075, max: 0.0027 });
  });

  it('is unknown when the defaults could not be read', () => {
    expect(moduleRange([500, 0, 0n], { defaultScalingFactor: undefined })).toBeUndefined();
  });
});

describe('getAlgebraFeeRange', () => {
  it('spans base fee to base fee plus both alphas (thena btcb-wbnb)', () => {
    expect(getAlgebraFeeRange([[1500, 1000, 150, 40000, 24, 6000, 0, 10, 490]])).toEqual({
      min: 0.00049,
      max: 0.00299,
    });
  });

  it('covers both swap directions (camelot)', () => {
    expect(
      getAlgebraFeeRange([
        [500, 2000, 360, 60000, 59, 8500, 0, 10, 2000],
        [500, 1000, 360, 60000, 59, 8500, 0, 10, 1000],
      ])
    ).toEqual({ min: 0.001, max: 0.0045 });
  });
});

describe('ClmFeesApi', () => {
  const api = new ClmFeesApi({ id: 'base' } as ChainEntity);
  const clm = { id: 'clm', contractAddress: '0x1', poolAddress: '0x2' } as VaultCowcentrated;

  it('reads swapFee() as a fraction, undefined where it failed', async () => {
    multicall.mockResolvedValueOnce([
      { status: 'success', result: 3_000_000_000_000_000n },
      { status: 'failure', error: new Error('revert') },
    ]);

    const fees = await api.fetchSwapFees([clm, { ...clm, id: 'clm-2' }]);

    expect(fees).toEqual([
      { id: 'clm', swapFee: 0.003 },
      { id: 'clm-2', swapFee: undefined },
    ]);
  });

  it('does not reject when the rpc fails', async () => {
    multicall.mockRejectedValueOnce(new Error('rpc down'));
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});

    expect(await api.fetchSwapFees([clm])).toEqual([{ id: 'clm', swapFee: undefined }]);
  });

  it('has no range for pools without known fee bounds', async () => {
    multicall.mockImplementation(({ contracts }: { contracts: { functionName: string }[] }) =>
      Promise.resolve(
        contracts.map(({ functionName }) =>
          functionName === 'swapFee' ? { status: 'success', result: 5n * 10n ** 14n }
          : functionName === 'factory' ? { status: 'success', result: '0x3' }
          : functionName === 'tickSpacing' ? { status: 'success', result: 10 }
          : { status: 'failure', error: new Error('revert') }
        )
      )
    );

    expect(await api.fetchSwapFeesWithRange([clm])).toEqual({
      fees: [{ id: 'clm', swapFee: 0.0005, range: undefined }],
      complete: true,
    });
    multicall.mockReset();
  });

  it('is incomplete without ranges when an rpc request fails', async () => {
    multicall.mockImplementation(({ contracts }: { contracts: { functionName: string }[] }) =>
      contracts[0]?.functionName === 'tickSpacing' ?
        Promise.reject(new Error('rpc down'))
      : Promise.resolve(
          contracts.map(({ functionName }) =>
            functionName === 'swapFee' ?
              { status: 'success', result: 5n * 10n ** 14n }
            : { status: 'failure', error: new Error('revert') }
          )
        )
    );
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});

    expect(await api.fetchSwapFeesWithRange([clm])).toEqual({
      fees: [{ id: 'clm', swapFee: 0.0005 }],
      complete: false,
    });
    multicall.mockReset();
  });
});
