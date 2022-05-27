import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: '8px',
    rowGap: '8px',
    columnGap: '8px',
  },
});
