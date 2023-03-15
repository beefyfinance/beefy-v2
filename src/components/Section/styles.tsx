import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  sectionContainer: {
    marginTop: '48px',
  },
  titleContainer: {
    marginBottom: '24px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.secondary,
  },
  subTitle: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.disabled,
    marginTop: '8px',
  },
});
