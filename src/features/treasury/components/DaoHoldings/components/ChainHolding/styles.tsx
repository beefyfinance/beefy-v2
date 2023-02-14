import { Theme } from '@material-ui/core';

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
    backgroundColor: '#242842',
    borderRadius: '8px 8px 0px 0px',

    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  icon: {
    height: '32px',
  },
  nameContainer: {
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  },
  chainName: { color: theme.palette.text.primary },
  usdValue: { color: theme.palette.text.primary },
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
    backgroundColor: 'rgba(130, 71, 228, 0.2)',
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
    backgroundColor: 'rgba(195, 19, 111, 0.2)',
  },
  'headerNetwork-cronos': {
    backgroundColor: 'rgba(18, 25, 38, 1)',
  },
  'headerNetwork-fuse': {
    backgroundColor: 'rgba(227, 246, 139, 0.2)',
  },
  'headerNetwork-metis': {
    backgroundColor: 'rgba(0, 218, 204, 0.2)',
  },
  'headerNetwork-aurora': {
    backgroundColor: 'rgba(112, 212, 75, 0.2)',
  },
  'headerNetwork-moonbeam': {
    backgroundColor: 'rgba(33, 20, 56, 0.4)',
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
});
