import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenErc20 } from '../../entities/token.ts';

const wallet = vi.hoisted(() => ({ writeApprove: vi.fn(), sendTransaction: vi.fn() }));
const flags = vi.hoisted(() => ({ disableExactApprovals: false }));

vi.mock('../../apis/rpc-contract/rpc-manager.ts', () => ({
  rpcClientManager: {
    getBatchClient: () => ({ chain: undefined }),
  },
}));
vi.mock('../../apis/instances.ts', () => ({
  getWalletConnectionApi: async () => ({ getConnectedViemClient: async () => ({}) }),
}));
vi.mock('../../apis/rpc-contract/viem-contract.ts', () => ({
  fetchWalletContract: () => ({ write: { approve: wallet.writeApprove } }),
}));
vi.mock('../../utils/feature-flags.ts', () => ({
  featureFlag_disableExactApprovals: () => flags.disableExactApprovals,
}));
vi.mock('../../utils/gas-utils.ts', () => ({ getGasPriceOptions: async () => ({}) }));
vi.mock('../../selectors/wallet.ts', () => ({ selectWalletAddress: () => USER }));
vi.mock('../../selectors/tokens.ts', () => ({
  selectChainNativeToken: () => ({ id: 'ETH' }),
}));
vi.mock('../../selectors/chains.ts', () => ({ selectChainById: () => ({}) }));
vi.mock('./common.ts', () => ({
  captureWalletErrors: <T>(func: T) => func,
  txStart: () => {},
  sendTransaction: wallet.sendTransaction,
}));

import { approve, getApproveSteps } from './approval.ts';

const USER = '0x00000000000000000000000000000000000000aa';
const SPENDER = '0x00000000000000000000000000000000000000bb';
const USDT = {
  id: 'USDT',
  type: 'erc20',
  chainId: 'ethereum',
  address: '0x00000000000000000000000000000000000000cc',
  symbol: 'USDT',
  decimals: 6,
} as unknown as TokenErc20;
const t = ((key: string) => key) as unknown as TFunction<Namespace>;
const bn = (value: string) => new BigNumber(value);
const UNLIMITED = 8_000_000_000_000_000_000_000_000_000n;

describe('getApproveSteps', () => {
  const required = { token: USDT, spenderAddress: SPENDER, amount: bn('100') };

  beforeEach(() => {
    flags.disableExactApprovals = false;
  });

  const steps = (allowance: string, unlimited?: boolean) =>
    getApproveSteps(required, bn(allowance), t, unlimited);

  it('returns no steps when the allowance already covers the amount', () => {
    expect(steps('100')).toEqual([]);
    expect(steps('150')).toEqual([]);
  });

  it('approves exact when the allowance is short', () => {
    const [step] = steps('40');
    expect(step.message).toBe('Vault-ApproveMsg');
    expect(step.extraInfo?.approval).toMatchObject({ ...required, kind: 'exact' });
  });

  it('approves unlimited when asked', () => {
    const [step] = steps('0', true);
    expect(step.message).toBe('Vault-ApproveUnlimitedMsg');
    expect(step.extraInfo?.approval?.kind).toBe('unlimited');
  });

  it('approves unlimited when exact approvals are disabled', () => {
    flags.disableExactApprovals = true;
    expect(steps('0')[0].extraInfo?.approval?.kind).toBe('unlimited');
  });
});

describe('approve', () => {
  beforeEach(() => {
    wallet.writeApprove.mockReset();
    wallet.sendTransaction.mockReset();
    flags.disableExactApprovals = false;
  });

  async function approved(amount: BigNumber, unlimited?: boolean) {
    const thunk = approve(USDT, SPENDER, amount, unlimited);
    await thunk(vi.fn(), (() => ({})) as never, undefined);
    const { builder, additionalData } = wallet.sendTransaction.mock.calls[0][0];
    builder();
    return { wei: wallet.writeApprove.mock.calls[0][0][1], additionalData };
  }

  it('approves the exact amount', async () => {
    const { wei, additionalData } = await approved(bn('1.5'));
    expect(wei).toBe(1_500_000n);
    expect(additionalData.amount.toString(10)).toBe('1.5');
  });

  it('approves a large fixed amount when unlimited', async () => {
    const { wei, additionalData } = await approved(bn('1.5'), true);
    expect(wei).toBe(UNLIMITED);
    expect(additionalData.amount.shiftedBy(6).toString(10)).toBe(UNLIMITED.toString(10));
  });

  it('approves the unlimited amount when exact approvals are disabled', async () => {
    flags.disableExactApprovals = true;
    const { wei } = await approved(bn('1.5'));
    expect(wei).toBe(UNLIMITED);
  });

  it('approves more than the unlimited amount when the amount is larger', async () => {
    const { wei } = await approved(bn('9000000000000000000000'), true);
    expect(wei).toBe(9_000_000_000_000_000_000_000_000_000n);
  });
});
