import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import type * as CCTPProvider from '../apis/transact/cctp/CCTPProvider.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { TransactMode } from '../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../store/types.ts';
import {
  selectCrossChainSortedChains,
  selectTransactDepositInputVaultId,
  selectTransactDepositTokensForChainIdWithBalances,
} from './transact.ts';
import type * as WalletSelectors from './wallet.ts';

vi.mock('./wallet.ts', async importOriginal => ({
  ...(await importOriginal<typeof WalletSelectors>()),
  selectWalletAddress: () => USER,
  selectWalletAddressIfKnown: () => USER,
}));
vi.mock('../apis/transact/cctp/CCTPProvider.ts', async importOriginal => ({
  ...(await importOriginal<typeof CCTPProvider>()),
  getSupportedChainIds: () => [],
}));

const CHAIN = 'base';
const USER = '0x1111111111111111111111111111111111111111';
const CLM = '0x2222222222222222222222222222222222222222';
const MOO_CLM = '0x3333333333333333333333333333333333333333';
const RCLM = '0x4444444444444444444444444444444444444444';

function erc20(address: string, symbol: string) {
  return {
    type: 'erc20',
    id: symbol,
    symbol,
    oracleId: 'clm',
    chainId: CHAIN,
    address,
    decimals: 18,
  } as unknown as TokenEntity;
}

const mooClmToken = erc20(MOO_CLM, 'SOL-cbBTC mooCLM');
const rclmToken = erc20(RCLM, 'SOL-cbBTC rCLM');

function makeState(
  pageVaultId: VaultEntity['id'],
  input: TokenEntity,
  srcVaultId: string,
  mode: TransactMode = TransactMode.Deposit
) {
  const selectionId = `standard-${CHAIN}-${input.address}`;
  return {
    entities: {
      chains: { byId: { [CHAIN]: { id: CHAIN, name: 'Base' } } },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: {
              [CLM]: erc20(CLM, 'SOL-cbBTC CLM'),
              [MOO_CLM]: mooClmToken,
              [RCLM]: rclmToken,
            },
          },
        },
        prices: { byOracleId: { clm: new BigNumber(2) } },
      },
      vaults: {
        byId: {
          mooclm: {
            id: 'mooclm',
            type: 'standard',
            chainId: CHAIN,
            contractAddress: MOO_CLM,
            receiptTokenAddress: MOO_CLM,
            depositTokenAddress: CLM,
          },
          rclm: {
            id: 'rclm',
            type: 'gov',
            contractType: 'multi',
            chainId: CHAIN,
            contractAddress: RCLM,
            receiptTokenAddress: RCLM,
            depositTokenAddress: CLM,
          },
        },
        contractData: { byVaultId: { mooclm: { pricePerFullShare: new BigNumber(1.25) } } },
      },
    },
    user: {
      balance: {
        byAddress: {
          [USER]: {
            tokenAmount: {
              byChainId: {
                [CHAIN]: {
                  byTokenAddress: {
                    [MOO_CLM]: { balance: new BigNumber(1_000) },
                    [RCLM]: { balance: new BigNumber(400) },
                  },
                },
              },
            },
          },
        },
      },
    },
    ui: {
      transact: {
        mode,
        selectedSelectionId: selectionId,
        selections: {
          byChainId: { [CHAIN]: [selectionId] },
          bySelectionId: {
            [selectionId]: { id: selectionId, tokens: [input], order: 2, hideIfZeroBalance: true },
          },
        },
        options: {
          bySelectionId: { [selectionId]: ['move'] },
          byOptionId: {
            move: {
              id: 'move',
              strategyId: 'reward-pool-to-vault',
              mode: TransactMode.Deposit,
              vaultId: pageVaultId,
              chainId: CHAIN,
              selectionId,
              inputs: [input],
              srcVaultId,
            },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('transact selections holding a vault position', () => {
  it('lists vault shares as the vault position in the deposit token', () => {
    const state = makeState('rclm', mooClmToken, 'mooclm');
    const [row] = selectTransactDepositTokensForChainIdWithBalances(state, CHAIN, 'rclm');

    expect(row.balance?.toString(10)).toBe('1250');
    expect(row.balanceValue.toString(10)).toBe('2500');
    expect(row.decimals).toBe(18);
  });

  it('lists reward pool shares as the reward pool position in the deposit token', () => {
    const state = makeState('mooclm', rclmToken, 'rclm');
    const [row] = selectTransactDepositTokensForChainIdWithBalances(state, CHAIN, 'mooclm');

    expect(row.balance?.toString(10)).toBe('400');
    expect(row.balanceValue.toString(10)).toBe('800');
  });

  it('values the chain picker total and token by the vault position', () => {
    const state = makeState('rclm', mooClmToken, 'mooclm');
    const [chain] = selectCrossChainSortedChains(state, 'rclm');

    expect(chain.balanceUsd.toString(10)).toBe('2500');
    expect(chain.tokens.map(token => token.balanceUsd.toString(10))).toEqual(['2500']);
  });

  it('reads the selected move input as a position in its source vault', () => {
    const state = makeState('rclm', mooClmToken, 'mooclm');
    expect(selectTransactDepositInputVaultId(state)).toBe('mooclm');
  });

  it('does not read a vault position while on the withdraw tab', () => {
    const state = makeState('rclm', mooClmToken, 'mooclm', TransactMode.Withdraw);
    expect(selectTransactDepositInputVaultId(state)).toBeUndefined();
  });
});
