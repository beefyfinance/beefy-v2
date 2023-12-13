import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  sectionContainer: {
    marginTop: '48px',
    [theme.breakpoints.down('sm')]: {
      marginTop: '24px',
    },
  },
  titleContainer: {
    marginBottom: '24px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.middle,
  },
  subTitle: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    marginTop: '8px',
  },
});
