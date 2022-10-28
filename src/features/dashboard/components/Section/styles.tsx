import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  sectionContainer: {
    marginTop: '48px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.secondary,
    marginBottom: '24px',
  },
});
