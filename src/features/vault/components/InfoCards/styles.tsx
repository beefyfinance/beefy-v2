import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  sectionHeading: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  sectionText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0,
    },
  },
});
