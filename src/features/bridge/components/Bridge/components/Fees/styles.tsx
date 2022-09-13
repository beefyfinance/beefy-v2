import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  fees: {
    padding: '12px',
    backgroundColor: theme.palette.background.content,
    borderRadius: '8px',
  },
  advice: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    marginTop: '12px',
    '& p': {
      margin: '0 0 1em 0',
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  feesContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    rowGap: '16px',
    columnGap: '16px',
  },
  feesItem: {},
  label: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  feesLoader: {
    width: '100%',
  },
});
