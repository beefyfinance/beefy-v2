import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  feeContainer: {
    backgroundColor: theme.palette.background.light,
    borderRadius: '10px',
  },
  title: {
    ...theme.typography['subline-lg'],
    color: '#8585A6',
    marginBottom: '8px',
  },
  zapTitle: {
    marginBottom: '12px',
  },
  zapStep: {
    paddingLeft: '8px',
    marginBottom: '12px',
    color: theme.palette.text.secondary,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  ol: {
    paddingLeft: 14,
    marginBottom: 0,
  },
});
