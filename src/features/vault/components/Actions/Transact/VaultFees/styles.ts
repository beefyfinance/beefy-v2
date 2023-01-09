import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    border: 'solid 2px #2D3153',
    borderRadius: '8px',
    padding: '12px',
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
