import { RouteProps } from 'react-router';

export type RedirectType = {
  from: string | string[] | RouteProps;
  to: string;
};
export const REDIRECTS: RedirectType[] = [
  { from: { path: '/bsc', exact: true }, to: '/' },
  { from: { path: '/heco', exact: true }, to: '/' },
  { from: { path: '/avax', exact: true }, to: '/' },
  { from: { path: '/polygon', exact: true }, to: '/' },
  { from: { path: '/fantom', exact: true }, to: '/' },
  { from: { path: '/harmony', exact: true }, to: '/' },
  { from: { path: '/arbitrum', exact: true }, to: '/' },
  { from: { path: '/celo', exact: true }, to: '/' },
  { from: { path: '/moonriver', exact: true }, to: '/' },
  { from: { path: '/cronos', exact: true }, to: '/' },
  { from: { path: '/fuse', exact: true }, to: '/' },
  { from: { path: '/metis', exact: true }, to: '/' },
  { from: { path: '/aurora', exact: true }, to: '/' },
  { from: { path: '/moonbeam', exact: true }, to: '/' },
];
