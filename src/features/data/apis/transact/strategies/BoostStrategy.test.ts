import { describe, expect, it, vi } from 'vitest';
import type * as walletSelectors from '../../../selectors/wallet.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { VaultStandard } from '../../../entities/vault.ts';
import type { BeefyState } from '../../../store/types.ts';
import { baseWeth, bn, erc20Token, makeState } from '../helpers/same-balance.test-helper.ts';
import type {
  ZapStrategyIdToDepositOption,
  ZapStrategyIdToWithdrawOption,
} from '../transact-types.ts';
import { StandardVaultType } from '../vaults/StandardVaultType.ts';
import { BoostZapStrategy } from './BoostStrategy.ts';
import type { ZapTransactHelpers } from './IStrategy.ts';
import type { ZapStrategyId } from './strategy-configs.ts';
import { VaultStrategy } from './vault/VaultStrategy.ts';

// the withdraw order is built for a connected user; reading one for real needs a browser
vi.mock('../../../selectors/wallet.ts', async importOriginal => ({
  ...(await importOriginal<typeof walletSelectors>()),
  selectWalletAddress: () => USER,
  selectWalletAddressOrThrow: () => USER,
}));

// a vault holding 20 WETH against 10 shares: 1 share is worth 2 WETH
vi.mock('../../rpc-contract/viem-contract.ts', () => ({
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
  id: 'arc-usdc-boost',
  type: 'boost',
  chainId: 'base',
  vaultId: vault.id,
  contractAddress: BOOST,
  version: 2,
} as unknown as BoostPromoEntity;

// the decorator is typed over zap strategy ids; the vault route only differs in its discriminator
const depositOption = {
  id: 'base-weth-vault',
  vaultId: vault.id,
} as unknown as ZapStrategyIdToDepositOption<ZapStrategyId>;
const withdrawOption = {
  id: 'base-weth-vault',
  vaultId: vault.id,
} as unknown as ZapStrategyIdToWithdrawOption<ZapStrategyId>;

function makeBaseState(): BeefyState {
  const state = makeState({
    ui: { transact: { swapSlippage: 0.01 } },
    user: {
      wallet: { address: USER },
      balance: { byAddress: { [USER]: { tokenAmount: { byChainId: {} } } } },
    },
  });
  const chainTokens = state.entities.tokens.byChainId.base!;
  chainTokens.byId[mooWeth.id] = mooWeth.address;
  chainTokens.byAddress[mooWeth.address] = mooWeth;
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

function makeStrategies() {
  const state = makeBaseState();
  const getState = () => state;
  const helpers = {
    vault,
    vaultType: new StandardVaultType(vault, getState),
    zap: { manager: MANAGER, router: ROUTER },
    getState,
  } as unknown as ZapTransactHelpers;

  const plain = new VaultStrategy(helpers.vaultType, helpers);
  return { plain, boosted: new BoostZapStrategy(plain, helpers, boost) };
}

const tenWeth = { token: baseWeth, amount: bn('10'), max: false };

describe('the plain vault route is untouched by being composable', () => {
  it('deposit quotes stay non-zap and keep approving the vault', async () => {
    const { plain } = makeStrategies();

    const quote = await plain.fetchDepositQuote([tenWeth], depositOption);

    // 'steps' is what turns on the zap route, the slippage control and the price impact gate
    expect('steps' in quote).toBe(false);
    expect('fee' in quote).toBe(false);
    expect(quote.allowances).toEqual([
      { token: baseWeth, amount: bn('10'), spenderAddress: vault.contractAddress },
    ]);
  });

  it('withdraw quotes stay non-zap and need no approval at all', async () => {
    const { plain } = makeStrategies();

    const quote = await plain.fetchWithdrawQuote([tenWeth], withdrawOption);

    expect('steps' in quote).toBe(false);
    expect(quote.allowances).toEqual([]);
  });
});

describe('the boost decorator over the plain vault route', () => {
  it('deposits by depositing then staking, approving the manager', async () => {
    const { boosted } = makeStrategies();

    const quote = await boosted.fetchDepositQuote([tenWeth], depositOption);
    expect(quote.steps.map(step => step.type)).toEqual(['deposit', 'stake']);
    expect(quote.fee).toEqual({ value: 0 });
    expect(quote.allowances.map(allowance => allowance.spenderAddress)).toEqual([MANAGER]);

    const { zapRequest, expectedTokens } = await boosted.fetchDepositUserlessZapBreakdown(quote);
    expect(zapRequest.order.inputs).toEqual([
      { token: baseWeth.address, amount: '10000000000000000000' },
    ]);
    // 10 WETH at ppfs 2 is 5 shares, less 1% slippage; the receipt takes the share token's floor
    expect(zapRequest.order.outputs).toEqual([
      { token: BOOST, minOutputAmount: '4950000000000000000' },
      { token: mooWeth.address, minOutputAmount: '0' },
      { token: baseWeth.address, minOutputAmount: '0' },
    ]);
    expect(zapRequest.steps).toHaveLength(2);
    expect(zapRequest.steps[1]).toMatchObject({ target: BOOST });
    expect(expectedTokens.map(token => token.address)).toEqual([BOOST, mooWeth.address]);
  });

  it('withdraws by unstaking then withdrawing, pulling the receipt', async () => {
    const { boosted } = makeStrategies();

    const quote = await boosted.fetchWithdrawQuote([tenWeth], withdrawOption);
    expect(quote.steps.map(step => step.type)).toEqual(['unstake', 'withdraw']);
    // the plain route needs no allowance, so the decorator derives the shares itself
    expect(quote.allowances).toEqual([
      {
        token: expect.objectContaining({ address: BOOST }),
        amount: bn('5'),
        spenderAddress: MANAGER,
      },
    ]);

    const { zapRequest, expectedTokens } = await boosted.fetchWithdrawUserlessZapBreakdown(quote);
    expect(zapRequest.order.inputs).toEqual([{ token: BOOST, amount: '5000000000000000000' }]);
    expect(zapRequest.steps).toHaveLength(2);
    expect(zapRequest.steps[0]).toMatchObject({ target: BOOST });
    // the receipt is listed so any leftover comes back to the user
    expect(zapRequest.order.outputs).toContainEqual({ token: BOOST, minOutputAmount: '0' });
    expect(expectedTokens.map(token => token.address)).toEqual([baseWeth.address]);
  });
});
