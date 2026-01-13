import {
  generatePath,
  type LoaderFunctionArgs,
  matchPath,
  type PathPattern,
  redirect,
} from 'react-router';

export type RedirectType = {
  from: string | PathPattern<string>;
  to: string;
};

const REDIRECTS: RedirectType[] = [
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

export async function redirectLoader({ request }: LoaderFunctionArgs) {
  const { pathname } = new URL(request.url);
  for (const { from, to } of REDIRECTS) {
    const match = matchPath(from, pathname);
    if (match) {
      const redirectTo = generatePath(to, match.params);
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- https://reactrouter.com/api/utils/redirect
      throw redirect(redirectTo);
    }
  }
}
