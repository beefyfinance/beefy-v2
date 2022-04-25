import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  supertitle: {
    color: theme.palette.text.disabled,
    fontSize: '15px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
});
