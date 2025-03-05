import type { ChainId } from '../../../../entities/chain.ts';

// https://api.unstoppabledomains.com/resolve/supported_tlds
// UD TLDs can be registered on ethereum or polygon
export const tldToChain = {
  crypto: ['ethereum', 'polygon'],
  bitcoin: ['ethereum', 'polygon'],
  blockchain: ['ethereum', 'polygon'],
  unstoppable: ['ethereum', 'polygon'],
  dao: ['ethereum', 'polygon'],
  nft: ['ethereum', 'polygon'],
  '888': ['ethereum', 'polygon'],
  wallet: ['ethereum', 'polygon'],
  x: ['ethereum', 'polygon'],
  klever: ['ethereum', 'polygon'],
  hi: ['ethereum', 'polygon'],
  kresus: ['ethereum', 'polygon'],
  polygon: ['ethereum', 'polygon'],
  anime: ['ethereum', 'polygon'],
  manga: ['ethereum', 'polygon'],
  binanceus: ['ethereum', 'polygon'],
  go: ['ethereum', 'polygon'],
  altimist: ['ethereum', 'polygon'],
  pudgy: ['ethereum', 'polygon'],
  austin: ['ethereum', 'polygon'],
  bitget: ['ethereum', 'polygon'],
  pog: ['ethereum', 'polygon'],
  clay: ['ethereum', 'polygon'],
  witg: ['ethereum', 'polygon'],
  metropolis: ['ethereum', 'polygon'],
  wrkx: ['ethereum', 'polygon'],
  secret: ['ethereum', 'polygon'],
  zil: ['ethereum', 'polygon'],
  com: ['ethereum', 'polygon'],
  // 'eth': ['ethereum', 'polygon'], // we resolve eth tld with ens resolver
} as const satisfies Record<string, ChainId[]>;
