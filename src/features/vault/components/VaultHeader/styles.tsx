import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  titleHolder: {
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'center',
    gap: '8px 12px',
    flexGrow: 1,
    [theme.breakpoints.up('lg')]: {
      marginBottom: '0',
    },
  },
  title: {
    ...theme.typography['h1'],
    color: theme.palette.text.middle,
  },
  titleAsset: {},
  titleTag: {},
  titleHolderWithTag: {
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
      '& $titleAsset': {
        width: '32px',
        height: '32px',
      },
      '& $title': {
        width: '100%',
        order: 10,
      },
    },
  },
  labelsHolder: {
    display: 'flex',
    rowGap: '24px',
    columnGap: '24px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  platformLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    '& span': {
      color: theme.palette.text.light,
      textTransform: 'uppercase' as const,
    },
  },
  shareHolder: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    marginLeft: 'auto',
  },
});
