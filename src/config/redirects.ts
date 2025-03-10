export type RedirectType = {
  from: string | string[];
  to: string;
};

export const REDIRECTS: RedirectType[] = [
  { from: '/:chain/vault/:vaultId', to: '/vault/:vaultId' },
  { from: '/%23/:chain/vault/:vaultId', to: '/vault/:vaultId' },
  {
    from: [
      '/:chain(bsc|heco|avax|polygon|fantom|harmony|arbitrum|celo|moonriver|cronos|fuse|metis|aurora|moonbeam)',
    ],
    to: '/',
  },
];
