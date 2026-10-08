import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { TransactQuote } from '../../apis/transact/transact-types.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../../store/types.ts';
import { withZapDetails } from './transact.ts';

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
