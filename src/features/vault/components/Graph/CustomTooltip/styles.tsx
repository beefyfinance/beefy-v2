import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: '#272B4A',
    padding: '12px 16px',
    minWidth: '250px',
    background: '#fff',
    borderRadius: '8px',
    textAlign: 'left' as const,
    '& p': {
      margin: '0 0 8px 0',
      '&:last-child': {
        margin: 0,
      },
    },
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  value: {
    ...theme.typography['body-lg-med'],
  },
  maDetail: {
    ...theme.typography['body-sm'],
    lineHeight: 0,
    paddingBottom: 12,
  },
});
