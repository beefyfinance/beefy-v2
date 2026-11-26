import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { encodeFunctionData, HttpRequestError, RpcRequestError } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi.ts';
import type { TokenErc20 } from '../../entities/token.ts';

const rpc = vi.hoisted(() => ({
  transports: [{ request: vi.fn() }, { request: vi.fn() }, { request: vi.fn() }],
}));
const wallet = vi.hoisted(() => ({ writeApprove: vi.fn(), sendTransaction: vi.fn() }));
const flags = vi.hoisted(() => ({ disableExactApprovals: false }));

vi.mock('../../apis/rpc-contract/rpc-manager.ts', () => ({
  rpcClientManager: {
    getSingleClient: () => ({ transport: { transports: rpc.transports } }),
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

const rpcError = (code: number, message: string) =>
  new RpcRequestError({ body: {}, error: { code, message }, url: 'https://rpc' });
const rateLimited = () => new HttpRequestError({ url: 'https://rpc', status: 429 });

describe('getApproveSteps', () => {
  const required = { token: USDT, spenderAddress: SPENDER, amount: bn('100') };
  const [first, second, third] = rpc.transports;

  beforeEach(() => {
    rpc.transports.forEach(transport => transport.request.mockReset());
  });

  const messages = async (allowance: string, unlimited?: boolean) =>
    (await getApproveSteps(required, bn(allowance), USER, t, unlimited)).map(s => s.message);

  it('returns no steps when the allowance already covers the amount', async () => {
    expect(await messages('100')).toEqual([]);
    expect(await messages('150')).toEqual([]);
  });

  it('approves without checking for a reset when the current allowance is zero', async () => {
    expect(await messages('0')).toEqual(['Vault-ApproveMsg']);
    expect(first.request).not.toHaveBeenCalled();
  });

  it('approves directly when changing a non-zero allowance is accepted', async () => {
    first.request.mockResolvedValue('0x');
    expect(await messages('40')).toEqual(['Vault-ApproveMsg']);
    expect(first.request).toHaveBeenCalledWith({
      method: 'eth_call',
      params: [
        {
          from: USER,
          to: USDT.address,
          data: encodeFunctionData({
            abi: ERC20Abi,
            functionName: 'approve',
            args: [SPENDER, 100_000_000n],
          }),
        },
        'latest',
      ],
    });
  });

  it('prepends a reset step when changing a non-zero allowance reverts', async () => {
    first.request.mockRejectedValue(rpcError(3, 'execution reverted'));
    const steps = await getApproveSteps(required, bn('40'), USER, t);
    expect(steps.map(s => s.message)).toEqual(['Vault-ApproveResetMsg', 'Vault-ApproveMsg']);
    expect(steps.map(s => s.step)).toEqual(['approve', 'approve']);
    expect(steps.map(s => s.extraInfo?.approval?.kind)).toEqual(['reset', 'exact']);
    expect(steps[0].extraInfo?.approval).toMatchObject({ token: USDT, spenderAddress: SPENDER });
  });

  it('finds a revert behind an RPC that is rate limited', async () => {
    first.request.mockRejectedValue(rateLimited());
    second.request.mockRejectedValue(rpcError(3, 'execution reverted'));
    expect(await messages('40')).toEqual(['Vault-ApproveResetMsg', 'Vault-ApproveMsg']);
  });

  it('treats a revert reported with a non-standard code as a revert', async () => {
    first.request.mockRejectedValue(rpcError(-32000, 'execution reverted'));
    expect(await messages('40')).toEqual(['Vault-ApproveResetMsg', 'Vault-ApproveMsg']);
  });

  it('does not add a reset step when every RPC fails without a revert', async () => {
    first.request.mockRejectedValue(rpcError(-32603, 'internal error'));
    second.request.mockRejectedValue(rateLimited());
    third.request.mockRejectedValue(rpcError(-32603, 'header not found'));
    expect(await messages('40')).toEqual(['Vault-ApproveMsg']);
  });

  it('skips the reset check when no wallet is connected', async () => {
    const steps = await getApproveSteps(required, bn('40'), undefined, t);
    expect(steps.map(s => s.message)).toEqual(['Vault-ApproveMsg']);
    expect(first.request).not.toHaveBeenCalled();
  });

  it('checks the reset against the unlimited amount when approving unlimited', async () => {
    first.request.mockResolvedValue('0x');
    expect(await messages('40', true)).toEqual(['Vault-ApproveUnlimitedMsg']);
    const { data } = first.request.mock.calls[0][0].params[0];
    expect(data).toBe(
      encodeFunctionData({ abi: ERC20Abi, functionName: 'approve', args: [SPENDER, UNLIMITED] })
    );
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

  it('approves zero for a reset', async () => {
    const { wei } = await approved(bn('0'));
    expect(wei).toBe(0n);
  });

  it('approves a large fixed amount when unlimited', async () => {
    const { wei, additionalData } = await approved(bn('1.5'), true);
    expect(wei).toBe(UNLIMITED);
    expect(additionalData.amount.shiftedBy(6).toString(10)).toBe(UNLIMITED.toString(10));
  });

  it('still approves zero for a reset when exact approvals are disabled', async () => {
    flags.disableExactApprovals = true;
    const { wei } = await approved(bn('0'));
    expect(wei).toBe(0n);
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
