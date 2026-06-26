import type { Address } from 'viem';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import type { BeefyState } from '../../features/data/store/types.ts';

/**
 * Per-chain list of tokens that can serve as the routing handoff in a same-chain
 * vault-to-vault zap (`VaultToVaultSingleTokenStrategy`).
 */
export type V2VRoutingTokenConfig = Partial<Record<ChainEntity['id'], readonly Address[]>>;

export const V2V_ROUTING_TOKENS: V2VRoutingTokenConfig = {
  arbitrum: ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'], // WETH
  avax: ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'], // WAVAX
  base: ['0x4200000000000000000000000000000000000006'], // WETH
  berachain: ['0x6969696969696969696969696969696969696969'], // WBERA
  bsc: ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'], // WBNB
  ethereum: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'], // WETH
  fraxtal: ['0xFc00000000000000000000000000000000000002'], // WFRAX
  gnosis: ['0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'], // WXDAI
  hyperevm: ['0x5555555555555555555555555555555555555555'], // WHYPE
  linea: ['0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'], // WETH
  lisk: ['0x4200000000000000000000000000000000000006'], // WETH
  megaeth: ['0x4200000000000000000000000000000000000006'], // WETH
  monad: ['0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A'], // WMON
  optimism: ['0x4200000000000000000000000000000000000006'], // WETH
  plasma: ['0x6100E367285b01F48D07953803A2d8dCA5D19873'], // WXPL
  polygon: ['0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'], // WPOL
  rootstock: ['0x542fDA317318eBF1d3DEAf76E0b632741A7e677d'], // WRBTC
  sei: ['0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7'], // WSEI
  sonic: ['0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38'], // wS
  zksync: ['0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'], // WETH
};

export function hasRoutingTokensForChain(chainId: ChainEntity['id']): boolean {
  const addresses = V2V_ROUTING_TOKENS[chainId];
  return addresses !== undefined && addresses.length > 0;
}

export function getRoutingTokensForChain(
  chainId: ChainEntity['id'],
  state: BeefyState
): TokenEntity[] {
  const addresses = V2V_ROUTING_TOKENS[chainId];
  if (!addresses?.length) return [];
  const tokens: TokenEntity[] = [];
  for (const address of addresses) {
    try {
      tokens.push(selectTokenByAddress(state, chainId, address));
    } catch (err) {
      console.warn(
        `[v2v] Configured routing token ${address} not found in state for chain ${chainId}`,
        err
      );
    }
  }
  return tokens;
}
