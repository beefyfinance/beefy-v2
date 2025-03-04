import type { ChainId } from '../../../../entities/chain.ts';

export const tldToChain = {
  eth: ['ethereum'],
} as const satisfies Record<string, ChainId[]>;
