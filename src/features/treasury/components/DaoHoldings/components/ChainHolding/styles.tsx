import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    ...theme.typography.h3,
    padding: '16px 24px',
    display: 'flex',
    columnGap: '12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px 8px 0px 0px',

    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  marketMakerAnnotation: {
    position: 'relative' as const,
    bottom: '0.5em',
    fontSize: '0.5em',
  },
  icon: {
    height: '32px',
  },
  mmNameContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  nameContainer: {
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  },
  mmName: {
    color: theme.palette.text.light,
    paddingLeft: '12px',
  },
  chainName: { color: theme.palette.text.light },
  usdValue: { color: theme.palette.text.light },
  'headerNetwork-bsc': {
    backgroundColor: 'rgba(240, 185, 11, 0.2)',
  },
  'headerNetwork-heco': {
    backgroundColor: 'rgba(2, 148, 63, 0.2)',
  },
  'headerNetwork-avax': {
    backgroundColor: 'rgba(231, 65, 66, 0.2)',
  },
  'headerNetwork-polygon': {
    backgroundColor: 'rgba(245, 240, 253, 0.3)',
  },
  'headerNetwork-fantom': {
    backgroundColor: 'rgba(25, 105, 255, 0.2)',
  },
  'headerNetwork-harmony': {
    backgroundColor: 'rgba(0, 216, 175, 0.2)',
  },
  'headerNetwork-arbitrum': {
    backgroundColor: 'rgba(40, 159, 239, 0.2)',
  },
  'headerNetwork-celo': {
    backgroundColor: 'rgba(252, 254, 83, 0.14)',
  },
  'headerNetwork-moonriver': {
    backgroundColor: 'rgba(6, 53, 61, 0.4)',
  },
  'headerNetwork-cronos': {
    backgroundColor: 'rgba(18, 25, 38, 1)',
  },
  'headerNetwork-fuse': {
    backgroundColor: 'rgba(180, 249, 186, 0.2)',
  },
  'headerNetwork-metis': {
    backgroundColor: 'rgba(0, 207, 255, 0.4)',
  },
  'headerNetwork-aurora': {
    backgroundColor: 'rgba(112, 212, 75, 0.2)',
  },
  'headerNetwork-moonbeam': {
    backgroundColor: 'rgba(149, 143, 220, 0.4)',
  },
  'headerNetwork-optimism': {
    backgroundColor: 'rgba(255, 4, 32, 0.2)',
  },
  'headerNetwork-emerald': {
    backgroundColor: 'rgba(1, 146, 246, 0.2)',
  },
  'headerNetwork-kava': {
    backgroundColor: 'rgba(255, 86, 79, 0.2)',
  },
  'headerNetwork-ethereum': {
    backgroundColor: 'rgba(98, 126, 233, 0.2)',
  },
  'headerNetwork-canto': {
    backgroundColor: 'rgba(6, 252, 153, 0.2)',
  },
  'headerNetwork-zksync': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  'headerNetwork-zkevm': {
    backgroundColor: 'rgba(130, 71, 228, 0.2)',
  },
  'headerNetwork-base': {
    backgroundColor: 'rgba(0, 82, 255, 0.2)',
  },
  'headerNetwork-gnosis': {
    backgroundColor: 'rgba(19, 54, 41, 0.4)',
  },
  'headerNetwork-linea': {
    backgroundColor: 'rgba(18, 18, 18, 0.2)',
  },
  'headerNetwork-mantle': {
    backgroundColor: 'rgba(18, 18, 18, 0.2)',
  },
  'headerNetwork-fraxtal': {
    backgroundColor: 'rgba(18, 18, 18, 0.2)',
  },
  'headerNetwork-mode': {
    backgroundColor: 'rgba(18, 18, 18, 0.2)',
  },
  'headerNetwork-manta': {
    backgroundColor: 'rgb(201, 203, 206)',
  },
  'headerNetwork-real': {
    backgroundColor: 'rgba(28, 18, 44, 0.4)',
  },
  'headerNetwork-sei': {
    backgroundColor: 'rgba(28, 18, 44, 0.4)',
  },
  'headerNetwork-rootstock': {
    backgroundColor: 'rgba(28, 18, 44, 0.4)',
  },
  'headerNetwork-scroll': {
    backgroundColor: 'rgb(201, 203, 206)',
  },
  'headerNetwork-sonic': {
    background: 'linear-gradient(90deg, rgba(16,40,60,0.5) 0%, rgba(254,154,76,0.5) 100%)',
  },
  'headerMM-system9': {
    backgroundColor: 'rgba(243, 243, 200, 0.5)',
  },
});
