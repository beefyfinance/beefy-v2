import type { ChainId } from '../../../chains/entity-types.ts';

export const tldToChain = {
  // .base.eth
  eth: ['base'],
} as const satisfies Record<string, ChainId[]>;
