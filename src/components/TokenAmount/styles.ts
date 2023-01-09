import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  withTooltip: {
    textDecoration: 'underline 1px dotted',
    cursor: 'default' as const,
  },
});
