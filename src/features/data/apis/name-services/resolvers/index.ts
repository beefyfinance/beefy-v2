import type { Resolver } from '../types';

export const resolvers: Resolver[] = [
  {
    tldToChain: async () => (await import('./ens/tlds')).tldToChain,
    methods: async () => await import('./ens/resolver'),
  },
  {
    tldToChain: async () => (await import('./space-id/tlds')).tldToChain,
    methods: async () => await import('./space-id/resolver'),
  },
  {
    tldToChain: async () => (await import('./unstoppable/tlds')).tldToChain,
    methods: async () => await import('./unstoppable/resolver'),
  },
];
