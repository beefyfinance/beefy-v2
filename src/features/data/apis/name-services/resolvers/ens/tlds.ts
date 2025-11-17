import type { ChainId } from '../../../chains/entity-types.ts';

export const tldToChain = {
  eth: ['ethereum'],
} as const satisfies Record<string, ChainId[]>;
