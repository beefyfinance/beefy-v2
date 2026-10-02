import type { BoostPromoEntity, PromoReward } from '../entities/promo.ts';
import type { TokenErc20 } from '../entities/token.ts';
import type { VaultGovMulti, VaultGovSingle, VaultStandard } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { baseUsdc, erc20Token, makeState } from './transact/helpers/same-balance.test-helper.ts';

export const rewardBifi = erc20Token(
  'base',
  'BIFIbase',
  'BIFI',
  '0xb1f1000000000000000000000000000000000b1f',
  18
);
export const rewardUsdc = erc20Token(
  'base',
  'USDCbridged',
  'USDC',
  '0xbbbb000000000000000000000000000000000bbb',
  6
);
const mooUsdc = erc20Token(
  'base',
  'mooUSDC',
  'mooUSDC',
  '0x0000000000000000000000000000000000000a00',
  18
);

const standardVault = {
  id: 'moo-usdc',
  type: 'standard',
  chainId: 'base',
  contractAddress: mooUsdc.address,
  receiptTokenAddress: mooUsdc.address,
  depositTokenAddress: baseUsdc.address,
} as unknown as VaultStandard;

export const govSingle = {
  id: 'gov-single',
  type: 'gov',
  contractType: 'single',
  chainId: 'base',
  contractAddress: '0x0000000000000000000000000000000000000a01',
  receiptTokenAddress: mooUsdc.address,
  depositTokenAddress: baseUsdc.address,
  earnedTokenAddresses: [rewardBifi.address],
} as unknown as VaultGovSingle;

export const govMulti = {
  id: 'gov-multi',
  type: 'gov',
  contractType: 'multi',
  chainId: 'base',
  contractAddress: '0x0000000000000000000000000000000000000a02',
  receiptTokenAddress: mooUsdc.address,
  depositTokenAddress: baseUsdc.address,
  earnedTokenAddresses: [rewardBifi.address],
} as unknown as VaultGovMulti;

export function promoReward(token: TokenErc20): PromoReward {
  return {
    type: 'token',
    address: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    oracleId: token.oracleId,
    oracle: 'tokens',
    chainId: token.chainId,
  };
}

export const boostV1 = {
  id: 'boost-v1',
  type: 'boost',
  version: 1,
  chainId: 'base',
  vaultId: standardVault.id,
  contractAddress: '0x0000000000000000000000000000000000000b01',
  rewards: [promoReward(rewardBifi)],
} as unknown as BoostPromoEntity;

export const boostV2 = {
  ...boostV1,
  id: 'boost-v2',
  version: 2,
  contractAddress: '0x0000000000000000000000000000000000000b02',
  rewards: [promoReward(rewardBifi), promoReward(rewardUsdc)],
} as unknown as BoostPromoEntity;

export function makeRewardsState(): BeefyState {
  const state = makeState();
  const base = state.entities.tokens.byChainId.base!;
  const extraTokens = [rewardBifi, rewardUsdc, mooUsdc];

  return {
    ...state,
    entities: {
      ...state.entities,
      tokens: {
        ...state.entities.tokens,
        byChainId: {
          ...state.entities.tokens.byChainId,
          base: {
            ...base,
            byId: {
              ...base.byId,
              ...Object.fromEntries(extraTokens.map(t => [t.id, t.address.toLowerCase()])),
            },
            byAddress: {
              ...base.byAddress,
              ...Object.fromEntries(extraTokens.map(t => [t.address.toLowerCase(), t])),
            },
          },
        },
      },
      vaults: {
        byId: Object.fromEntries([standardVault, govSingle, govMulti].map(v => [v.id, v])),
      },
      promos: {
        byId: Object.fromEntries([boostV1, boostV2].map(b => [b.id, b])),
      },
    },
  } as unknown as BeefyState;
}
