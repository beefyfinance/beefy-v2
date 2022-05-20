import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  rows: {
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
    fontSize: '14px',
    lineHeight: '18px',
  },
  label: {
    '&:nth-last-child(2)': {
      fontWeight: 700,
    },
  },
  value: {
    textAlign: 'right' as const,
    '&:last-child': {
      fontWeight: 700,
    },
  },
  last: {
    fontWeight: 700,
  },
});
