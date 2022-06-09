import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  cardActions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginTop: theme.spacing(1),
  },
  cardAction: {},
  text: {
    margin: '0 0 32px 0',
    whiteSpace: 'pre-line' as const,
    color: theme.palette.text.secondary,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  detailTitle: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
});
