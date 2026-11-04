import { describe, expect, it, vi } from 'vitest';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses.ts';
import type { VaultStandard } from '../../../../entities/vault.ts';
import type { BeefyState } from '../../../../store/types.ts';
import {
  ARC_USDC_ADDRESS,
  arcNative,
  arcUsdc,
  bn,
  erc20Token,
  makeState,
} from '../../helpers/same-balance.test-helper.ts';
import { SwapAggregator } from '../../swap/SwapAggregator.ts';
import { WNativeSwapProvider } from '../../swap/wnative/WNativeSwapProvider.ts';
import { StandardVaultType } from '../../vaults/StandardVaultType.ts';
import type { SingleDepositOption } from '../../transact-types.ts';
import type { ZapTransactHelpers } from '../IStrategy.ts';
import { SingleStrategy } from './SingleStrategy.ts';

vi.mock('../../../rpc-contract/viem-contract.ts', () => ({
  fetchContract: () => ({
    read: { getPricePerFullShare: async () => 2_000000000000000000n },
  }),
}));

const ROUTER = '0xaEFB7C930b9181A31a0CDF0409375b78C059395C';
const MANAGER = '0x000000000000000000000000000000000000beef';
const mooUsdc = erc20Token(
  'arc',
  'mooArcUSDC',
  'mooArcUSDC',
  '0x000000000000000000000000000000000000d001',
  18
);

const vault = {
  id: 'arc-usdc',
  type: 'standard',
  chainId: 'arc',
  depositTokenAddress: ARC_USDC_ADDRESS,
  contractAddress: mooUsdc.address,
  assetIds: ['USDC'],
} as unknown as VaultStandard;

function makeArcState(): BeefyState {
  const state = makeState({ ui: { transact: { swapSlippage: 0.01 } } });
  const chainTokens = state.entities.tokens.byChainId.arc!;
  chainTokens.byId[mooUsdc.id] = mooUsdc.address;
  chainTokens.byAddress[mooUsdc.address] = mooUsdc;
  Object.assign(state.entities.tokens, { prices: { byOracleId: {} } });
  Object.assign(state.entities, {
    fees: { byId: {} },
    vaults: { byId: { [vault.id]: vault } },
  });
  return state;
}

function makeStrategy() {
  const state = makeArcState();
  const getState = () => state;
  const helpers = {
    vault,
    vaultType: new StandardVaultType(vault, getState),
    zap: { manager: MANAGER, router: ROUTER },
    swapAggregator: new SwapAggregator([new WNativeSwapProvider()]),
    getState,
  } as unknown as ZapTransactHelpers;

  return new SingleStrategy({ strategyId: 'single' }, helpers);
}

const option = {
  id: 'arc-usdc-single',
  vaultId: vault.id,
  chainId: 'arc',
} as unknown as SingleDepositOption;

describe('SingleStrategy arc order, native in to an erc20 vault', () => {
  it('sends the whole order: native in at 18dp, the deposit driven off the 6dp erc20 view', async () => {
    const strategy = makeStrategy();
    const input = { token: arcNative, amount: bn('10'), max: false };

    const quote = await strategy.fetchDepositQuote([input], option);
    const { zapRequest, expectedTokens } = await strategy.fetchDepositUserlessZapBreakdown(quote);

    // the router is paid in native, so the order input is the zero address at native decimals
    expect(zapRequest.order.inputs).toEqual([
      { token: ZERO_ADDRESS, amount: '10000000000000000000' },
    ]);

    // native -> the erc20 view needs no call, so the deposit is the only step
    expect(zapRequest.steps).toHaveLength(1);
    expect(zapRequest.steps[0]).toMatchObject({ target: mooUsdc.address, value: '0' });
    // depositAll, so no amount is inserted: the router deposits the erc20 view's 6dp balance
    expect(zapRequest.steps[0].tokens).toEqual([{ token: ARC_USDC_ADDRESS, index: -1 }]);

    // shares are minted against the 6dp deposit: 10 USDC at ppfs 2.0 is 5e6 share units, -1%
    // slippage. Both views of the balance are listed as outputs so any dust comes back
    expect(zapRequest.order.outputs).toEqual([
      { token: mooUsdc.address, minOutputAmount: '4950000' },
      { token: ARC_USDC_ADDRESS, minOutputAmount: '0' },
      { token: ZERO_ADDRESS, minOutputAmount: '0' },
    ]);
    expect(expectedTokens).toEqual([mooUsdc]);
  });

  it('quotes the same funds one for one, floored to the erc20 view', async () => {
    const strategy = makeStrategy();

    const quote = await strategy.fetchDepositQuote(
      [{ token: arcNative, amount: bn('10.0000005'), max: false }],
      option
    );

    expect(quote.swapQuote?.providerId).toBe('wnative');
    expect(quote.outputs).toEqual([{ token: arcUsdc, amount: bn('10') }]);
  });
});
