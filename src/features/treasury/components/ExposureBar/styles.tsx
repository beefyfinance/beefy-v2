import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  bar: {
    height: '12px',
    width: '100%',
    borderRadius: '80px',
    display: 'flex',
    '& $barItem:first-child': {
      borderRadius: '80px 0px 0px 80px',
    },
    '& $barItem:last-child': {
      borderRadius: '0px 80px 80px 0px',
      borderRight: 'none',
    },
  },
  barItem: {
    height: '100%',
    borderRight: `2px solid ${theme.palette.background.dashboard.cardBg}`,
  },
});
