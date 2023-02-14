import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  center: {
    display: 'flex',
    alingItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  icon: {
    height: '16px',
    width: '16px',
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
    padding: `${8 - 2}px`,
    border: '2px solid #363A61',
    backgroundColor: '#373C63',
    borderRadius: '4px',
  },
  item: {
    ...theme.typography['body-lg'],
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    '& img': {
      height: '12px',
      width: '12px',
    },
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.text.primary,
    },
  },
});
