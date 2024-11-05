import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.contentLight,
    padding: '16px',
    borderRadius: '12px',
  },
  titleContainer: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '16px',
    flexWrap: 'wrap' as const,
    [theme.breakpoints.up('sm')]: {
      '& $assetIconSymbol': {
        order: 1,
        flexGrow: 0,
      },
      '& $assetBridgePrice': {
        flexGrow: 1,
        order: 2,
      },
      '& $assetLinks': {
        order: 3,
      },
    },
    [theme.breakpoints.up('lg')]: {
      '& $assetLinkText': {
        display: 'inline',
      },
    },
  },
  assetIconSymbol: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    gap: '8px',
    flexGrow: 1,
  },
  assetIcon: {},
  assetSymbol: {
    ...theme.typography['body-lg-med'],
    flexGrow: 1,
  },
  assetBridgePrice: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    gap: '8px',
  },
  assetBridge: {},
  assetPrice: {},
  assetLinks: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    gap: '8px',
  },
  assetLinkText: {
    display: 'none',
  },
  assetWebsite: {},
  assetContract: {},
  assetDocumentation: {},
  description: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
    marginTop: '16px',
    whiteSpace: 'pre-line' as const,
  },
});
