import BigNumber from 'bignumber.js';
import { decodeFunctionData, toFunctionSelector } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import { ChargeFeeStrategy } from '../strategies/ChargeFeeStrategy.ts';
import type { IComposableStrategy, ZapTransactHelpers } from '../strategies/IStrategy.ts';
import type { ZapQuoteStepFee } from '../transact-types.ts';
import type { UserlessZapOrder, ZapStep } from '../zap/types.ts';
import { applyWithdrawFeeToOrder } from './fee.ts';
import {
  arcNative,
  arcUsdc,
  baseNative,
  baseUsdc,
  baseWeth,
  bn,
  makeState,
} from './same-balance-fixture.ts';
import { NO_RELAY } from './zap.ts';

const RECIPIENT = '0xA55e75C4815Ff39eFD76C257857441d9FD99b45b';
const VAULT_WITHDRAW_STEP: ZapStep = { target: '0x01', value: '0', data: '0x', tokens: [] };
const MOO_ADDRESS = '0x00000000000000000000000000000000000000aa';

const state = makeState();

function feeStep(
  token: TokenEntity,
  gross: string,
  bps: number,
  extra: Partial<ZapQuoteStepFee> = {}
): ZapQuoteStepFee {
  // quote-time split on the unslipped gross; applyWithdrawFeeToOrder must not reuse it
  const grossAmount = bn(gross);
  const feeAmount = grossAmount.times(bps).div(10000).decimalPlaces(6, BigNumber.ROUND_FLOOR);
  return {
    type: 'fee',
    token,
    recipient: RECIPIENT,
    bps,
    grossAmount,
    feeAmount,
    netAmount: grossAmount.minus(feeAmount),
    ...extra,
  };
}

function order(outputs: UserlessZapOrder['outputs']): UserlessZapOrder {
  return { inputs: [{ token: MOO_ADDRESS, amount: '1' }], outputs, relay: NO_RELAY };
}

function transferOf(step: ZapStep) {
  const decoded = decodeFunctionData({ abi: ERC20Abi, data: step.data as `0x${string}` });
  if (decoded.functionName !== 'transfer') {
    throw new Error(`Expected transfer, got ${decoded.functionName}`);
  }
  return { target: step.target, to: decoded.args[0], amount: decoded.args[1], value: step.value };
}

function minOf(o: UserlessZapOrder, address: string) {
  return o.outputs.find(output => output.token.toLowerCase() === address.toLowerCase())
    ?.minOutputAmount;
}

describe('applyWithdrawFeeToOrder', () => {
  it('erc20 output: charges bps of the slipped gross and lowers the min to what is left', () => {
    const o = order([
      { token: baseUsdc.address.toLowerCase(), minOutputAmount: '990000000' },
      { token: MOO_ADDRESS, minOutputAmount: '0' },
    ]);
    const steps = [VAULT_WITHDRAW_STEP];

    applyWithdrawFeeToOrder(o, steps, feeStep(baseUsdc, '1000', 10), state, 0.01);

    expect(steps).toHaveLength(2);
    expect(steps[0]).toBe(VAULT_WITHDRAW_STEP);
    expect(steps[1].tokens).toEqual([]);
    // 10 bps of 990 (1000 slipped by 1%), not of the quoted 1000
    expect(transferOf(steps[1])).toEqual({
      target: baseUsdc.address,
      to: RECIPIENT,
      amount: 990000n,
      value: '0',
    });
    expect(minOf(o, baseUsdc.address)).toBe('989010000');
    expect(minOf(o, MOO_ADDRESS)).toBe('0');
  });

  it('native output on a normal chain: wraps then transfers the fee in 18 decimals', () => {
    const o = order([{ token: ZERO_ADDRESS, minOutputAmount: '1492500000000000000' }]);
    const steps: ZapStep[] = [];

    applyWithdrawFeeToOrder(o, steps, feeStep(baseNative, '1.5', 5), state, 0.005);

    expect(steps).toHaveLength(2);
    expect(steps[0]).toMatchObject({
      target: baseWeth.address,
      value: '746250000000000',
      data: toFunctionSelector('deposit()'),
    });
    expect(transferOf(steps[1])).toMatchObject({
      target: baseWeth.address,
      amount: 746250000000000n,
    });
    expect(minOf(o, ZERO_ADDRESS)).toBe('1491753750000000000');
  });

  it('arc native output: one erc20 transfer at 6 decimals, the min stays in native wei', () => {
    const gross = '100.123456789012345678';
    const execGrossWei = 99122222221122222221n; // slipBy(gross, 1%, 18)
    const o = order([
      { token: ZERO_ADDRESS, minOutputAmount: execGrossWei.toString() },
      { token: arcUsdc.address, minOutputAmount: '0' },
    ]);
    const steps: ZapStep[] = [];

    applyWithdrawFeeToOrder(o, steps, feeStep(arcNative, gross, 5), state, 0.01);

    expect(steps).toHaveLength(1);
    const transfer = transferOf(steps[0]);
    expect(transfer).toEqual({
      target: arcUsdc.address,
      to: RECIPIENT,
      amount: 49561n,
      value: '0',
    });
    expect(minOf(o, ZERO_ADDRESS)).toBe('99072661221122222221');
    // the router is left with exactly the new min: nothing below the erc20 precision is skimmed
    expect(execGrossWei - transfer.amount * 10n ** 12n).toBe(BigInt(minOf(o, ZERO_ADDRESS)!));
    expect(minOf(o, arcUsdc.address)).toBe('0');
  });

  it('arc erc20 output: same fee as the native view of the same balance', () => {
    const o = order([{ token: arcUsdc.address, minOutputAmount: '99122221' }]);
    const steps: ZapStep[] = [];

    applyWithdrawFeeToOrder(o, steps, feeStep(arcUsdc, '100.123456', 5), state, 0.01);

    expect(steps).toHaveLength(1);
    expect(transferOf(steps[0])).toMatchObject({ target: arcUsdc.address, amount: 49561n });
    expect(minOf(o, arcUsdc.address)).toBe('99072660');
  });

  it('arc native fee below the erc20 precision: no step, min unchanged', () => {
    const o = order([{ token: ZERO_ADDRESS, minOutputAmount: '1000000000000000' }]);
    const steps: ZapStep[] = [];

    applyWithdrawFeeToOrder(o, steps, feeStep(arcNative, '0.001', 5), state, 0);

    expect(steps).toEqual([]);
    expect(minOf(o, ZERO_ADDRESS)).toBe('1000000000000000');
  });

  it('zero bps: no step, min unchanged', () => {
    const o = order([{ token: baseUsdc.address, minOutputAmount: '990000000' }]);
    const steps = [VAULT_WITHDRAW_STEP];

    applyWithdrawFeeToOrder(o, steps, feeStep(baseUsdc, '1000', 0), state, 0.01);

    expect(steps).toEqual([VAULT_WITHDRAW_STEP]);
    expect(minOf(o, baseUsdc.address)).toBe('990000000');
  });

  it('reduced campaign fee: charges bps, never originalBps', () => {
    const o = order([{ token: baseUsdc.address, minOutputAmount: '990000000' }]);
    const steps: ZapStep[] = [];

    applyWithdrawFeeToOrder(
      o,
      steps,
      feeStep(baseUsdc, '1000', 2, { originalBps: 10 }),
      state,
      0.01
    );

    expect(transferOf(steps[0]).amount).toBe(198000n);
    expect(minOf(o, baseUsdc.address)).toBe('989802000');
  });

  it('never raises a min that is already below the post-fee floor', () => {
    const o = order([{ token: baseUsdc.address, minOutputAmount: '1' }]);

    applyWithdrawFeeToOrder(o, [], feeStep(baseUsdc, '1000', 10), state, 0.01);

    expect(minOf(o, baseUsdc.address)).toBe('1');
  });

  it('throws when the order has no output for the fee token', () => {
    const o = order([{ token: arcUsdc.address, minOutputAmount: '1' }]);
    // arc native is paid out under the zero address, not under the erc20 view
    expect(() => applyWithdrawFeeToOrder(o, [], feeStep(arcNative, '1', 5), state, 0.01)).toThrow(
      'fee-basis output not found'
    );
  });
});

describe('ChargeFeeStrategy.fetchWithdrawUserlessZapBreakdown', () => {
  it('asks the inner strategy for the gross output, then applies the fee to its order', async () => {
    const slippedGrossWei = '99122222221122222221';
    const inner = {
      id: 'single',
      fetchWithdrawUserlessZapBreakdown: vi.fn(async () => ({
        zapRequest: {
          order: order([{ token: ZERO_ADDRESS, minOutputAmount: slippedGrossWei }]),
          steps: [VAULT_WITHDRAW_STEP],
        },
        expectedTokens: [arcNative],
      })),
    } as unknown as IComposableStrategy<'single'>;
    const withSlippage = {
      ...state,
      ui: { transact: { swapSlippage: 0.01 } },
    } as unknown as BeefyState;
    const strategy = new ChargeFeeStrategy(inner, {
      getState: () => withSlippage,
    } as unknown as ZapTransactHelpers);
    const fee = feeStep(arcNative, '100.123456789012345678', 5);
    const withdrawStep = { type: 'withdraw' };

    const breakdown = await strategy.fetchWithdrawUserlessZapBreakdown({
      outputs: [{ token: arcNative, amount: fee.netAmount }],
      steps: [withdrawStep, fee],
    } as never);

    expect(inner.fetchWithdrawUserlessZapBreakdown).toHaveBeenCalledWith(
      expect.objectContaining({
        outputs: [{ token: arcNative, amount: fee.grossAmount }],
        steps: [withdrawStep],
      })
    );
    expect(breakdown.zapRequest.steps).toHaveLength(2);
    expect(transferOf(breakdown.zapRequest.steps[1]).amount).toBe(49561n);
    expect(minOf(breakdown.zapRequest.order, ZERO_ADDRESS)).toBe('99072661221122222221');
  });
});
