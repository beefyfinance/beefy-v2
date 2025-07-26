import type { ChainId } from '../../../../entities/chain.ts';

export const tldToChain = {
  // .base.eth
  eth: ['base'],
} as const satisfies Record<string, ChainId[]>;
