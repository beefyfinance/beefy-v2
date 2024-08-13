import type { ChainId } from '../../../../entities/chain';

export const tldToChain = {
  eth: ['ethereum'],
} as const satisfies Record<string, ChainId[]>;
