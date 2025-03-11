import type { PathPattern } from 'react-router';

export type RedirectType = {
  from: string | string[] | PathPattern<string>;
  to: string;
};

export const REDIRECTS: RedirectType[] = [
  { from: { path: '/:chain/vault/:vaultId', end: true }, to: '/vault/:vaultId' },
  { from: { path: '/%23/:chain/vault/:vaultId', end: true }, to: '/vault/:vaultId' },
  {
    from: {
      path: '/:chain(bsc|heco|avax|polygon|fantom|harmony|arbitrum|celo|moonriver|cronos|fuse|metis|aurora|moonbeam)',
      end: true,
    },
    to: '/',
  },
];
