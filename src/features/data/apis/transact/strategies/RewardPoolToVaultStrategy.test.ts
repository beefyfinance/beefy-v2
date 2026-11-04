import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { decodeFunctionData } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StandardVaultAbi } from '../../../../../config/abi/StandardVaultAbi.ts';
import { zapExecuteOrder } from '../../../actions/wallet/zap.ts';
import type {
  VaultEntity,
  VaultGovCowcentrated,
  VaultStandardCowcentrated,
} from '../../../entities/vault.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import type { ZapEntity } from '../../../entities/zap.ts';
import type * as WalletSelectors from '../../../selectors/wallet.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import { GovVaultType } from '../vaults/GovVaultType.ts';
import { StandardVaultType } from '../vaults/StandardVaultType.ts';
import type { UserlessZapRequest } from '../zap/types.ts';
import { RewardPoolToVaultStrategy } from './RewardPoolToVaultStrategy.ts';

vi.mock('../../rpc-contract/viem-contract.ts', () => ({ fetchContract: vi.fn() }));
vi.mock('../../../actions/wallet/zap.ts', () => ({ zapExecuteOrder: vi.fn() }));
vi.mock('../../../selectors/wallet.ts', async importOriginal => ({
  ...(await importOriginal<typeof WalletSelectors>()),
  selectWalletAddress: () => USER,
  selectWalletAddressOrThrow: () => USER,
}));

const CHAIN = 'base';
const USER = '0x1111111111111111111111111111111111111111';
const CLM = '0x2222222222222222222222222222222222222222';
const MOO_CLM = '0x3333333333333333333333333333333333333333';
const RCLM = '0x4444444444444444444444444444444444444444';
const ROUTER = '0x5555555555555555555555555555555555555555';
const MANAGER = '0x6666666666666666666666666666666666666666';

const VAULT_BALANCE_WEI = 1_000n * 10n ** 18n;
const VAULT_TOTAL_SUPPLY_WEI = 800n * 10n ** 18n;
const PPFS = new BigNumber(1.25);
const WITHDRAW_FEE = 0.001;
const SLIPPAGE = 0.01;

function erc20(address: string, symbol: string) {
  return {
    type: 'erc20',
    id: symbol,
    symbol,
    oracleId: symbol,
    chainId: CHAIN,
    address,
    decimals: 18,
  };
}

const cowcentratedIds = { pool: 'rclm', vault: 'mooclm', pools: [], vaults: [] };

const clmVault = {
  id: 'clm',
  type: 'cowcentrated',
  chainId: CHAIN,
  contractAddress: CLM,
  receiptTokenAddress: CLM,
  depositTokenAddress: '0x7777777777777777777777777777777777777777',
  cowcentratedIds,
};

const mooClmVault = {
  id: 'mooclm',
  type: 'standard',
  subType: 'cowcentrated',
  chainId: CHAIN,
  contractAddress: MOO_CLM,
  receiptTokenAddress: MOO_CLM,
  depositTokenAddress: CLM,
  depositFee: 0,
  cowcentratedIds,
};

const rewardPool = {
  id: 'rclm',
  type: 'gov',
  subType: 'cowcentrated',
  contractType: 'multi',
  chainId: CHAIN,
  contractAddress: RCLM,
  receiptTokenAddress: RCLM,
  depositTokenAddress: CLM,
  cowcentratedIds,
};

function makeState(): BeefyState {
  return {
    entities: {
      chains: { byId: { [CHAIN]: { id: CHAIN } } },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: {
              [CLM]: erc20(CLM, 'CLM'),
              [MOO_CLM]: erc20(MOO_CLM, 'mooCLM'),
              [RCLM]: erc20(RCLM, 'rCLM'),
            },
          },
        },
      },
      vaults: {
        byId: { clm: clmVault, mooclm: mooClmVault, rclm: rewardPool },
        byChainId: {
          [CHAIN]: { byAddress: { [CLM]: 'clm', [MOO_CLM]: 'mooclm', [RCLM]: 'rclm' } },
        },
        contractData: { byVaultId: { mooclm: { pricePerFullShare: PPFS } } },
      },
      fees: { byId: { mooclm: { id: 'mooclm', withdraw: WITHDRAW_FEE, deposit: 0 } } },
    },
    user: {
      balance: {
        byAddress: {
          [USER]: {
            tokenAmount: {
              byChainId: {
                [CHAIN]: { byTokenAddress: { [MOO_CLM]: { balance: new BigNumber(1_000) } } },
              },
            },
          },
        },
      },
    },
    ui: { transact: { swapSlippage: SLIPPAGE } },
  } as unknown as BeefyState;
}

function wei(amount: BigNumber.Value) {
  return new BigNumber(amount).shiftedBy(18).toString(10);
}

async function makeStrategy(pageVault: typeof rewardPool | typeof mooClmVault = rewardPool) {
  const state = makeState();
  const getState = () => state;
  const vaultType =
    pageVault === rewardPool ?
      new GovVaultType(rewardPool as unknown as VaultGovCowcentrated, getState)
    : new StandardVaultType(mooClmVault as unknown as VaultStandardCowcentrated, getState);
  const strategy = new RewardPoolToVaultStrategy(
    { strategyId: 'reward-pool-to-vault' },
    {
      vault: pageVault as unknown as VaultEntity,
      vaultType,
      getState,
      zap: { router: ROUTER, manager: MANAGER } as unknown as ZapEntity,
      swapAggregator: {} as unknown as ISwapAggregator,
    }
  );
  const [option] = await strategy.fetchDepositOptions();
  return { strategy, option, getState };
}

async function executeMove(
  amount: BigNumber.Value,
  pageVault: typeof rewardPool | typeof mooClmVault = rewardPool
) {
  const { strategy, option, getState } = await makeStrategy(pageVault);
  const quote = await strategy.fetchDepositQuote(
    [{ token: option.inputs[0], amount: new BigNumber(amount), max: false }],
    option
  );
  const t = ((key: string) => key) as unknown as TFunction<Namespace>;
  const step = await strategy.fetchDepositStep(quote, t);
  await step.action(vi.fn(), getState, {} as never);
  const [, zapRequest, expectedTokens] = vi.mocked(zapExecuteOrder).mock.calls[0] as [
    string,
    UserlessZapRequest,
    TokenEntity[],
  ];
  return { zapRequest, expectedTokens };
}

beforeEach(() => {
  vi.mocked(zapExecuteOrder).mockReset().mockReturnValue(vi.fn());
  vi.mocked(fetchContract)
    .mockReset()
    .mockReturnValue({
      read: {
        balance: async () => VAULT_BALANCE_WEI,
        totalSupply: async () => VAULT_TOTAL_SUPPLY_WEI,
        balanceOf: async () => 1_000n * 10n ** 18n,
        getPricePerFullShare: async () => (VAULT_BALANCE_WEI * 10n ** 18n) / VAULT_TOTAL_SUPPLY_WEI,
      },
    } as never);
});

describe('RewardPoolToVaultStrategy moving part of a vault position into the reward pool', () => {
  it('offers the vault share token as the input, sourced from the vault', async () => {
    const { option } = await makeStrategy();
    expect(option.inputs.map(token => token.address)).toEqual([MOO_CLM]);
    expect(option.srcVaultId).toBe('mooclm');
  });

  it('quotes the CLM worth the moved vault shares, net of the withdraw fee', async () => {
    const { strategy, option } = await makeStrategy();
    const quote = await strategy.fetchDepositQuote(
      [{ token: option.inputs[0], amount: new BigNumber(100), max: false }],
      option
    );

    expect(quote.outputs).toHaveLength(1);
    expect(quote.outputs[0].token.address).toBe(CLM);
    expect(quote.outputs[0].amount.toString(10)).toBe('124.875');
  });

  it('encodes a vault withdraw of exactly the shares the order pulls', async () => {
    const { zapRequest } = await executeMove(100);

    expect(zapRequest.order.inputs).toEqual([{ token: MOO_CLM, amount: wei(100) }]);
    const withdraw = zapRequest.steps[0];
    expect(withdraw.target).toBe(MOO_CLM);
    const { functionName, args } = decodeFunctionData({
      abi: StandardVaultAbi,
      data: withdraw.data as `0x${string}`,
    });
    expect(functionName).toBe('withdraw');
    expect(args?.[0]?.toString()).toBe(wei(100));
  });

  it('sets the minimum reward pool output from the value of the moved vault shares', async () => {
    const { zapRequest } = await executeMove(100);

    const rclmOutput = zapRequest.order.outputs.find(output => output.token === RCLM);
    expect(rclmOutput?.minOutputAmount).toBe(wei(new BigNumber('124.875').times(1 - SLIPPAGE)));
  });

  it('expects the reward pool shares the router returns', async () => {
    const { expectedTokens } = await executeMove(100);
    expect(expectedTokens.map(token => token.address)).toEqual([RCLM]);
  });
});

describe('RewardPoolToVaultStrategy moving a reward pool position into the vault', () => {
  it('offers the reward pool share token as the input, sourced from the reward pool', async () => {
    const { option } = await makeStrategy(mooClmVault);
    expect(option.inputs.map(token => token.address)).toEqual([RCLM]);
    expect(option.srcVaultId).toBe('rclm');
  });

  it('expects the vault shares the router returns', async () => {
    const { expectedTokens } = await executeMove(100, mooClmVault);
    expect(expectedTokens.map(token => token.address)).toEqual([MOO_CLM]);
  });
});
