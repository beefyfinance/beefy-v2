import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  labelText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '20px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    color: '#9595B2',
  },
  tooltipTrigger: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    marginLeft: '4px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
});
