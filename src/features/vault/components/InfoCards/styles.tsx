import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  sectionTitle: {
    color: theme.palette.text.secondary,
  },
  sectionText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
});
