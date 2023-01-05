import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  navLink: {
    display: 'flex',
    ...theme.typography['body-lg-med'],
    textDecoration: 'none',
    color: theme.palette.text.disabled,
    columnGap: '8px',
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '8px',
    },
    '&:hover': {
      color: theme.palette.text.primary,
      cursor: 'pointer',
    },
    '& a': {
      textDecoration: 'none',
      color: theme.palette.text.disabled,
      '&:hover': {
        color: theme.palette.text.primary,
        '& svg': {
          color: theme.palette.text.primary,
        },
      },
    },
  },
  active: {
    color: theme.palette.text.primary,
    '& svg ': {
      color: theme.palette.text.primary,
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
});
