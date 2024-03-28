import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: theme.palette.background.contentLight,
  },
  transactionFees: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '4px',
  },
  performanceFees: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    marginTop: '12px',
  },
  tooltipTrigger: {
    width: '16px',
    height: '16px',
    margin: 0,
    verticalAlign: 'middle',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
});
