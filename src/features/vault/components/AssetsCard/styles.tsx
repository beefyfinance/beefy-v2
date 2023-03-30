import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography.h2,
    color: theme.palette.text.primary,
    alignItems: 'center',
  },
  container: {},
  cards: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
});
