import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  rows: {
    ...theme.typography['body-lg'],
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
  label: {
    color: '#272B4A',
    '&:nth-last-child(2)': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
    },
  },
  value: {
    color: '#272B4A',
    textAlign: 'right' as const,
    '&:last-child': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
    },
  },
  last: {
    fontWeight: theme.typography['body-lg-med'].fontWeight,
  },
});
