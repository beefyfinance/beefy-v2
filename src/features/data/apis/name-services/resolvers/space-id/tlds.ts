import type { ChainId } from '../../../../entities/chain.ts';

// https://etherscan.io/address/0x754D6827A57334143eD5fB58C5b1A4aAe4396ba5#readContract
export const tldToChain = {
  bnb: ['bsc'],
  arb: ['arbitrum'],
  // eth: ['ethereum'], // we resolve eth tld with ens resolver
  // manta: ['manta'], // TODO uncomment when manta released
  gno: ['gnosis'],
  mode: ['mode'],
  cake: ['bsc'],
  // ll: ['lightlink'],
  // zkf: ['zkfair'],
  // tomo: ['edgeless'],
  // zeta: ['zeta'],
  // merlin: ['merlin'],
  burger: ['bsc'],
  floki: ['bsc'],
  // taiko: ['taiko'],
  // alien: ['alienx'],
} as const satisfies Record<string, ChainId[]>;
