import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    color: theme.palette.text.disabled,
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.text.primary,
    },
  },
  active: {
    color: theme.palette.text.primary,
    '& $arrow': {
      transform: 'rotateX(180deg)',
    },
  },
  arrow: {
    height: '16px',
    width: '16px',
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
    padding: `8px 16px`,
    border: '2px solid #30354F',
    backgroundColor: '#242737',
    borderRadius: '4px',
  },
});
