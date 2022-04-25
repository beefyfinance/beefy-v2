import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: theme.spacing(1),
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2),
  },
});
