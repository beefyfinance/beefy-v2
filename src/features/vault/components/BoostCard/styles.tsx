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
    color: theme.palette.text.secondary,
    margin: '0 0 32px 0',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  boostedBy: {
    ...theme.typography['subline-lg'],
    color: '#DB8332',
  },
});
