import type { Theme } from '@material-ui/core';
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
    opacity: '0',
    animation: '$fadeInOut 500ms ease-in-out forwards',
  },
  barItem: {
    height: '100%',
    borderRight: `2px solid ${theme.palette.background.v2.cardBg}`,
  },
  '@keyframes fadeInOut': {
    from: {
      opacity: '0',
    },
    to: {
      opacity: '1',
    },
  },
});
