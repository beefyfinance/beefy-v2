import { describe, expect, it, vi } from 'vitest';
import type * as walletSelectors from '../../../../selectors/wallet.ts';
import type { BoostPromoEntity } from '../../../../entities/promo.ts';
import type { VaultStandard } from '../../../../entities/vault.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { baseWeth, bn, erc20Token, makeState } from '../../helpers/same-balance.test-helper.ts';
import { SwapAggregator } from '../../swap/SwapAggregator.ts';
import type { SingleDepositOption, SingleWithdrawOption } from '../../transact-types.ts';
import { BoostShareSource } from '../../vaults/ShareSource.ts';
import { StandardVaultType } from '../../vaults/StandardVaultType.ts';
import type { ZapTransactHelpers } from '../IStrategy.ts';
import { SingleStrategy } from '../single/SingleStrategy.ts';
import { BoostStrategy, withBoost, withBoostShares } from './BoostStrategy.ts';

// the withdraw order is built for a connected user
vi.mock('../../../../selectors/wallet.ts', async importOriginal => ({
  ...(await importOriginal<typeof walletSelectors>()),
  selectWalletAddress: () => USER,
  selectWalletAddressOrThrow: () => USER,
}));

// a vault holding 20 WETH against 10 shares: 1 share is worth 2 WETH; the user holds 10 receipts
vi.mock('../../../rpc-contract/viem-contract.ts', () => ({
  fetchContract: () => ({
    read: {
      getPricePerFullShare: async () => 2_000000000000000000n,
      balance: async () => 20_000000000000000000n,
      totalSupply: async () => 10_000000000000000000n,
      balanceOf: async () => 10_000000000000000000n,
    },
  }),
}));

const ROUTER = '0xaEFB7C930b9181A31a0CDF0409375b78C059395C';
const MANAGER = '0x000000000000000000000000000000000000beef';
const BOOST = '0x000000000000000000000000000000000000b005';
const USER = '0x0000000000000000000000000000000000000001';
const mooWeth = erc20Token(
  'base',
  'mooBaseWETH',
  'mooBaseWETH',
  '0x000000000000000000000000000000000000d001',
  18
);

const receipt = erc20Token('base', 'moo_base-weth-boost', 'rmooBaseWETH', BOOST, 18);

const vault = {
  id: 'base-weth',
  type: 'standard',
  chainId: 'base',
  depositTokenAddress: baseWeth.address,
  contractAddress: mooWeth.address,
  receiptTokenAddress: mooWeth.address,
  assetIds: ['WETH'],
} as unknown as VaultStandard;

const boost = {
  id: 'moo_base-weth-boost',
  type: 'boost',
  chainId: 'base',
  vaultId: vault.id,
  contractAddress: BOOST,
  version: 2,
} as unknown as BoostPromoEntity;

function makeBaseState(): BeefyState {
  const state = makeState({
    ui: { transact: { swapSlippage: 0.01 } },
    user: {
      wallet: { address: USER },
      balance: {
        byAddress: {
          [USER]: {
            tokenAmount: { byChainId: {}, byBoostId: { [boost.id]: { balance: bn('10') } } },
          },
        },
      },
    },
  });
  const chainTokens = state.entities.tokens.byChainId.base!;
  for (const token of [mooWeth, receipt]) {
    chainTokens.byId[token.id] = token.address;
    chainTokens.byAddress[token.address] = token;
  }
  Object.assign(state.entities.tokens, { prices: { byOracleId: {} } });
  Object.assign(state.entities, {
    fees: { byId: {} },
    vaults: {
      byId: { [vault.id]: vault },
      contractData: { byVaultId: { [vault.id]: { pricePerFullShare: bn('2') } } },
    },
  });
  return state;
}

function makeBoosted() {
  const state = makeBaseState();
  const getState = () => state;
  const helpers = {
    vault,
    // what getStrategyForOption builds for a boosted route: shares are sourced from the boost
    vaultType: new StandardVaultType(vault, getState, new BoostShareSource(boost, mooWeth)),
    zap: { manager: MANAGER, router: ROUTER },
    swapAggregator: new SwapAggregator([]),
    getState,
  } as unknown as ZapTransactHelpers;

  return new BoostStrategy(new SingleStrategy({ strategyId: 'single' }, helpers), helpers, boost);
}

const identityOption = {
  id: 'single-base-weth-identity-boost',
  strategyId: 'single',
  vaultId: vault.id,
  chainId: 'base',
  inputs: [baseWeth],
  wantedOutputs: [baseWeth],
  boostId: boost.id,
} as unknown as SingleDepositOption;

const tenWeth = { token: baseWeth, amount: bn('10'), max: false };
const withdrawOption = {
  id: 'single-base-weth-identity-boost',
  strategyId: 'single',
  vaultId: vault.id,
  chainId: 'base',
  inputs: [baseWeth],
  wantedOutputs: [baseWeth],
  boostId: boost.id,
} as unknown as SingleWithdrawOption;
const allWeth = { token: baseWeth, amount: bn('20'), max: true };

describe('BoostStrategy deposit', () => {
  it('appends an estimated stake of the shares to the quote', async () => {
    const quote = await makeBoosted().fetchDepositQuote([tenWeth], identityOption);

    expect(quote.steps.map(step => step.type)).toEqual(['deposit', 'stake']);
    expect(quote.steps[1]).toEqual({
      type: 'stake',
      boostId: boost.id,
      inputs: [{ token: mooWeth, amount: bn('5') }],
    });
    expect(quote.allowances.map(allowance => allowance.spenderAddress)).toEqual([MANAGER]);
  });

  it('stakes the share floor and expects the receipt instead of the shares', async () => {
    const boosted = makeBoosted();
    const quote = await boosted.fetchDepositQuote([tenWeth], identityOption);

    const { zapRequest, expectedTokens, minBalances } =
      await boosted.fetchDepositUserlessZapBreakdown(quote);

    // 10 WETH at ppfs 2 is 5 shares, less 1% slippage; the receipt takes the share token's floor
    expect(zapRequest.order.outputs).toEqual([
      { token: BOOST, minOutputAmount: '4950000000000000000' },
      { token: mooWeth.address, minOutputAmount: '0' },
      { token: baseWeth.address, minOutputAmount: '0' },
    ]);
    expect(zapRequest.steps).toHaveLength(2);
    expect(zapRequest.steps[1]).toMatchObject({
      target: BOOST,
      tokens: [{ token: mooWeth.address, index: expect.any(Number) }],
    });
    expect(expectedTokens.map(token => token.address)).toEqual([BOOST, mooWeth.address]);
    expect(minBalances.get(mooWeth)).toEqual(bn('0'));
    expect(minBalances.get(expectedTokens[0])).toEqual(bn('5'));
  });
});

describe('BoostStrategy withdraw', () => {
  it('quotes MAX from the staked balance and prepends the unstake, pulling the receipt', async () => {
    const quote = await makeBoosted().fetchWithdrawQuote([allWeth], withdrawOption);

    expect(quote.steps.map(step => step.type)).toEqual(['unstake', 'withdraw']);
    expect(quote.steps[0]).toEqual({
      type: 'unstake',
      boostId: boost.id,
      outputs: [{ token: mooWeth, amount: bn('10') }],
    });
    // 10 staked shares at ppfs 2
    expect(quote.outputs).toEqual([{ token: baseWeth, amount: bn('20') }]);
    expect(quote.allowances).toEqual([
      { token: receipt, amount: bn('10'), spenderAddress: MANAGER },
    ]);
  });

  it('unstakes the receipt the router pulls and returns any leftover', async () => {
    const boosted = makeBoosted();
    const quote = await boosted.fetchWithdrawQuote([allWeth], withdrawOption);

    const { zapRequest, expectedTokens } = await boosted.fetchWithdrawUserlessZapBreakdown(quote);

    expect(zapRequest.order.inputs).toEqual([{ token: BOOST, amount: '10000000000000000000' }]);
    expect(zapRequest.steps).toHaveLength(2);
    expect(zapRequest.steps[0]).toMatchObject({
      target: BOOST,
      tokens: [{ token: BOOST, index: expect.any(Number) }],
    });
    expect(zapRequest.order.outputs).toContainEqual({ token: BOOST, minOutputAmount: '0' });
    expect(expectedTokens.map(token => token.address)).toEqual([baseWeth.address]);
  });
});

describe('withBoost / withBoostShares', () => {
  it('refuse a boost of another vault', () => {
    const state = makeBaseState();
    Object.assign(state.entities, { promos: { byId: { [boost.id]: boost } } });
    const getState = () => state;
    const other = { ...vault, id: 'base-other' } as VaultStandard;
    const helpers = {
      vault: other,
      vaultType: new StandardVaultType(other, getState),
      getState,
    } as unknown as ZapTransactHelpers;
    const single = new SingleStrategy({ strategyId: 'single' }, helpers);

    expect(() => withBoost(single, helpers, boost.id)).toThrow(/is for vault base-weth/);
    expect(() => withBoostShares(helpers, boost.id)).toThrow(/is for vault base-weth/);
  });
});
