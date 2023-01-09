import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    color: theme.palette.text.disabled,
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '4px',
    },
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
    height: '18px',
    width: '18px',
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
    padding: `8px`,
    border: '2px solid #30354F',
    backgroundColor: '#242737',
    borderRadius: '4px',
    marginLeft: '-8px',
  },
});
