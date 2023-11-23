import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'grid',
    columnGap: '24px',
    rowGap: '16px',
    width: '100%',
    color: theme.palette.text.disabled,
    background: theme.palette.background.v2.contentDark,
    padding: '24px',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    backgroundClip: 'padding-box',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    },
  },
});
