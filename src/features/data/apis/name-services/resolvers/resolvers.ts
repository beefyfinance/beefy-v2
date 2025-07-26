import type { Resolver } from '../types.ts';

export const resolvers: Resolver[] = [
  {
    tldToChain: async () => (await import('./ens/tlds.ts')).tldToChain,
    methods: async () => await import('./ens/resolver.ts'),
  },
  {
    tldToChain: async () => (await import('./basenames/tlds.ts')).tldToChain,
    methods: async () => await import('./basenames/resolver.ts'),
  },
  {
    tldToChain: async () => (await import('./space-id/tlds.ts')).tldToChain,
    methods: async () => await import('./space-id/resolver.ts'),
  },
  {
    tldToChain: async () => (await import('./unstoppable/tlds.ts')).tldToChain,
    methods: async () => await import('./unstoppable/resolver.ts'),
  },
];
