import BigNumber from 'bignumber.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TransactQuote } from '../../apis/transact/transact-types.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../../store/types.ts';
import type { TokenErc20 } from '../../entities/token.ts';
import { coverLiveBalanceIfMax, withZapDetails } from './transact.ts';

const rpc = vi.hoisted(() => ({ readContract: vi.fn() }));
vi.mock('../../apis/rpc-contract/rpc-manager.ts', () => ({
  rpcClientManager: { getSingleClient: () => rpc },
}));

const CHAIN = 'base';
const VAULT_SHARES = '0x000000000000000000000000000000000000d001';
const VAULT_WANT = '0x000000000000000000000000000000000000d002';
const POOL_SHARES = '0x000000000000000000000000000000000000d003';
const CLM = '0x000000000000000000000000000000000000d004';
const USDC = '0x000000000000000000000000000000000000d005';

const bn = (value: string) => new BigNumber(value);

function erc20(address: string, symbol: string) {
  return { type: 'erc20', id: symbol, symbol, chainId: CHAIN, address, decimals: 18 };
}

const mooVault = erc20(VAULT_SHARES, 'mooVault');
const want = erc20(VAULT_WANT, 'WANT');
const rclm = erc20(POOL_SHARES, 'CLM rCLM');
const clm = erc20(CLM, 'CLM');
const usdc = erc20(USDC, 'USDC');

/** a standard vault worth 2 WANT a share, and the CLM pool whose rCLM is 1:1 with CLM */
function makeState(): BeefyState {
  return {
    entities: {
      promos: { byChainId: {} },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: {
              [VAULT_SHARES]: mooVault,
              [VAULT_WANT]: want,
              [POOL_SHARES]: rclm,
              [CLM]: clm,
              [USDC]: usdc,
            },
          },
        },
      },
      vaults: {
        byId: {
          'test-vault': {
            id: 'test-vault',
            chainId: CHAIN,
            type: 'standard',
            contractAddress: VAULT_SHARES,
            receiptTokenAddress: VAULT_SHARES,
            depositTokenAddress: VAULT_WANT,
          },
          'test-pool': {
            id: 'test-pool',
            chainId: CHAIN,
            type: 'gov',
            contractType: 'multi',
            contractAddress: POOL_SHARES,
            receiptTokenAddress: POOL_SHARES,
            depositTokenAddress: CLM,
          },
        },
        contractData: {
          byVaultId: {
            'test-vault': { pricePerFullShare: bn('2') },
            // a gov pool has no ppfs of its own; this one is here to prove the 1:1 path ignores it
            'test-pool': { pricePerFullShare: bn('3') },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

const zapIn: Step = {
  step: 'zap-in',
  message: 'test',
  action: () => undefined,
  pending: false,
  extraInfo: { zap: true, vaultId: 'test-vault' },
};

function makeQuote(
  option: Record<string, unknown>,
  inputs: { token: unknown; amount: BigNumber }[],
  outputs: { token: unknown; amount: BigNumber }[] = [{ token: want, amount: bn('1') }]
): TransactQuote {
  return { option, inputs, outputs } as unknown as TransactQuote;
}

const vaultOption = { strategyId: 'single', vaultId: 'test-vault', mode: TransactMode.Deposit };

describe('withZapDetails', () => {
  it('describes a plain zap with what was sent and what was asked for', () => {
    const quote = makeQuote(vaultOption, [{ token: usdc, amount: bn('100') }]);

    const details = withZapDetails(zapIn, quote, makeState()).extraInfo?.zapDetails;

    expect(details?.inputs).toEqual([{ token: usdc, amount: bn('100') }]);
    expect(details?.outputTokens).toEqual([want]);
    expect(details?.vaultToVault).toBeUndefined();
  });

  it('leaves steps that are not zaps alone', () => {
    const quote = makeQuote(vaultOption, [{ token: usdc, amount: bn('100') }]);
    const deposit: Step = { ...zapIn, step: 'deposit' };

    expect(withZapDetails(deposit, quote, makeState())).toBe(deposit);
  });

  it('leaves cross-chain zaps alone, since their pending op describes them', () => {
    const quote = makeQuote(
      { strategyId: 'cross-chain', vaultId: 'test-vault', mode: TransactMode.Deposit },
      [{ token: usdc, amount: bn('100') }]
    );

    expect(withZapDetails(zapIn, quote, makeState())).toBe(zapIn);
  });

  it('drops the zero amounts a multi token quote carries', () => {
    const quote = makeQuote(
      vaultOption,
      [
        { token: usdc, amount: bn('100') },
        { token: want, amount: bn('0') },
      ],
      [
        { token: want, amount: bn('1') },
        { token: usdc, amount: bn('0') },
      ]
    );

    const details = withZapDetails(zapIn, quote, makeState()).extraInfo?.zapDetails;

    expect(details?.inputs).toHaveLength(1);
    expect(details?.outputTokens).toEqual([want]);
  });

  it('shows a withdraw quoted in vault shares as the deposit token', () => {
    // the gov composer swaps the quote inputs for the pool's rCLM
    const quote = makeQuote(
      { strategyId: 'gov-composer', vaultId: 'test-pool', mode: TransactMode.Withdraw },
      [{ token: rclm, amount: bn('5') }],
      [{ token: usdc, amount: bn('10') }]
    );

    const details = withZapDetails({ ...zapIn, step: 'zap-out' }, quote, makeState()).extraInfo
      ?.zapDetails;

    // rCLM is 1:1 with CLM, so the position reads the same as it does on the vault screens
    expect(details?.inputs).toEqual([{ token: clm, amount: bn('5') }]);
  });

  it('names both vaults for a vault-to-vault move, and converts the source shares', () => {
    const quote = makeQuote(
      {
        strategyId: 'vault-to-vault-single-token',
        vaultId: 'test-pool',
        srcVaultId: 'test-vault',
        destVaultId: 'test-pool',
        mode: TransactMode.Deposit,
      },
      [{ token: mooVault, amount: bn('3') }]
    );

    const details = withZapDetails(zapIn, quote, makeState()).extraInfo?.zapDetails;

    expect(details?.vaultToVault).toEqual({ srcVaultId: 'test-vault', destVaultId: 'test-pool' });
    // 3 shares at a ppfs of 2
    expect(details?.inputs).toEqual([{ token: want, amount: bn('6') }]);
  });

  it('names both vaults for a pool to vault conversion', () => {
    const quote = makeQuote(
      {
        strategyId: 'reward-pool-to-vault',
        vaultId: 'test-vault',
        srcVaultId: 'test-pool',
        mode: TransactMode.Deposit,
      },
      [{ token: rclm, amount: bn('5') }]
    );

    const details = withZapDetails(zapIn, quote, makeState()).extraInfo?.zapDetails;

    expect(details?.vaultToVault).toEqual({ srcVaultId: 'test-pool', destVaultId: 'test-vault' });
    expect(details?.inputs).toEqual([{ token: clm, amount: bn('5') }]);
  });
});

describe('coverLiveBalanceIfMax', () => {
  const USER = '0x00000000000000000000000000000000000000aa';
  const MANAGER = '0x00000000000000000000000000000000000000bb';
  const shares = mooVault as unknown as TokenErc20;
  const allowance = { token: shares, spenderAddress: MANAGER, amount: bn('10') };
  const quoteOf = (inputToken: object, max: boolean) =>
    ({ inputs: [{ token: inputToken, amount: bn('20'), max }] }) as unknown as TransactQuote;

  beforeEach(() => {
    rpc.readContract.mockReset();
  });

  it('raises a max withdraw approval to the live share balance', async () => {
    rpc.readContract.mockResolvedValue(12n * 10n ** 18n);
    const covered = await coverLiveBalanceIfMax(allowance, quoteOf(want, true), USER);
    expect(covered.amount.toString(10)).toBe('12');
    expect(rpc.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: VAULT_SHARES, functionName: 'balanceOf', args: [USER] })
    );
  });

  it('never lowers the quoted amount', async () => {
    rpc.readContract.mockResolvedValue(8n * 10n ** 18n);
    const covered = await coverLiveBalanceIfMax(allowance, quoteOf(want, true), USER);
    expect(covered.amount.toString(10)).toBe('10');
  });

  it('keeps the quoted amount when the input is not max', async () => {
    const covered = await coverLiveBalanceIfMax(allowance, quoteOf(want, false), USER);
    expect(covered).toBe(allowance);
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it('raises the approval when the shares are themselves the max input (vault to vault)', async () => {
    rpc.readContract.mockResolvedValue(12n * 10n ** 18n);
    const covered = await coverLiveBalanceIfMax(allowance, quoteOf(mooVault, true), USER);
    expect(covered.amount.toString(10)).toBe('12');
  });

  it('keeps the quoted amount for an input that is not max in a multi-input deposit', async () => {
    const quote = {
      inputs: [
        { token: want, amount: bn('20'), max: true },
        { token: mooVault, amount: bn('10'), max: false },
      ],
    } as unknown as TransactQuote;
    const covered = await coverLiveBalanceIfMax(allowance, quote, USER);
    expect(covered).toBe(allowance);
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it('keeps the quoted amount when the balance read fails', async () => {
    rpc.readContract.mockRejectedValue(new Error('rpc down'));
    const covered = await coverLiveBalanceIfMax(allowance, quoteOf(want, true), USER);
    expect(covered).toBe(allowance);
  });
});
