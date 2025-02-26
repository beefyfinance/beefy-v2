import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'grid',
    columnGap: '24px',
    rowGap: '16px',
    width: '100%',
    color: theme.palette.text.dark,
    background: theme.palette.background.contentDark,
    padding: '16px',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    backgroundClip: 'padding-box',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gap: '12px',
    },
  },
  searchWidth: {
    [theme.breakpoints.up('lg')]: {
      maxWidth: '75%',
    },
  },
});
