import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';

// arc: native USDC (18 decimals) and the 0x3600 ERC-20 (6 decimals) are one balance

export function nativeToken(
  chainId: ChainEntity['id'],
  symbol: string,
  id: string = symbol
): TokenNative {
  return {
    type: 'native',
    id,
    chainId,
    address: 'native',
    oracleId: symbol,
    decimals: 18,
    symbol,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  };
}

export function erc20Token(
  chainId: ChainEntity['id'],
  id: string,
  symbol: string,
  address: string,
  decimals: number
): TokenErc20 {
  return {
    type: 'erc20',
    id,
    chainId,
    address,
    oracleId: symbol,
    decimals,
    symbol,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  };
}

export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';

export const arcNative = nativeToken('arc', 'USDC', 'NATIVE');
export const arcUsdc = erc20Token('arc', 'USDC', 'USDC', ARC_USDC_ADDRESS, 6);
export const arcEurc = erc20Token(
  'arc',
  'EURC',
  'EURC',
  '0x0000000000000000000000000000000000000e0c',
  6
);
export const baseNative = nativeToken('base', 'ETH');
export const baseWeth = erc20Token(
  'base',
  'WETH',
  'WETH',
  '0x4200000000000000000000000000000000000006',
  18
);
export const baseUsdc = erc20Token(
  'base',
  'USDC',
  'USDC',
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  6
);
export const metisNative = nativeToken('metis', 'METIS', 'NATIVE');
export const metisWmetis = erc20Token(
  'metis',
  'WMETIS',
  'METIS',
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  18
);

function chainTokens(native: TokenNative, wnative: TokenErc20, ...others: TokenErc20[]) {
  const erc20s = [wnative, ...others];
  return {
    native: native.id,
    wnative: wnative.id,
    byId: Object.fromEntries([
      [native.id, 'native'],
      ...erc20s.map(token => [token.id, token.address.toLowerCase()]),
    ]),
    byAddress: Object.fromEntries([
      ['native', native],
      ...erc20s.map(token => [token.address.toLowerCase(), token]),
    ]),
  };
}

/** chains and tokens for arc, metis (both one balance) and base (not) */
export function makeState(extra: Record<string, unknown> = {}): BeefyState {
  return {
    entities: {
      chains: {
        allIds: ['arc', 'metis', 'base'],
        byId: {
          arc: {
            id: 'arc',
            native: { symbol: 'USDC', decimals: 18, balanceSharedWithWrapped: true },
          },
          metis: {
            id: 'metis',
            native: { symbol: 'METIS', decimals: 18, balanceSharedWithWrapped: true },
          },
          base: { id: 'base', native: { symbol: 'ETH', decimals: 18 } },
        },
      },
      zaps: { tokens: { byChainId: {} } },
      tokens: {
        byChainId: {
          arc: chainTokens(arcNative, arcUsdc, arcEurc),
          metis: chainTokens(metisNative, metisWmetis),
          base: chainTokens(baseNative, baseWeth, baseUsdc),
        },
      },
    },
    ...extra,
  } as unknown as BeefyState;
}

export const bn = (value: string) => new BigNumber(value);
