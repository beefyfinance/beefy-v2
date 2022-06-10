import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  sectionHeading: {
    ...theme.typography['h3'],
    color: theme.palette.text.secondary,
    margin: `0 0 8px 0`,
  },
  sectionText: {
    color: theme.palette.text.secondary,
    margin: `0 0 32px 0`,
    '&:last-child': {
      marginBottom: 0,
    },
  },
});
