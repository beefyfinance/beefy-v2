import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  navLink: {
    display: 'flex',
    ...theme.typography['body-lg-med'],
    textDecoration: 'none',
    color: theme.palette.text.dark,
    columnGap: '8px',
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '8px',
    },
    '&:hover': {
      color: theme.palette.text.light,
      cursor: 'pointer',
    },
    '& a': {
      textDecoration: 'none',
      color: theme.palette.text.dark,
      '&:hover': {
        color: theme.palette.text.light,
        '& svg': {
          color: theme.palette.text.light,
        },
      },
    },
  },
  active: {
    color: theme.palette.text.light,
    '& svg ': {
      color: theme.palette.text.light,
    },
  },
  itemMobile: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    display: 'flex',
    columnGap: '8px',
  },
  arrow: {
    height: '12px',
  },
  title: {},
  titleWithBadge: {
    position: 'relative' as const,
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
  },
  badge: {},
});
