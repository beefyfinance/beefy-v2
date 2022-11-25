import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  sortColumn: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    textAlign: 'right' as const,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  sortTooltipIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginLeft: '4px',
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },
  sortIcon: {
    marginLeft: '8px',
    width: '9px',
    height: '12px',
    fill: 'currentColor',
    display: 'block',
  },
  sortIconHighlight: {
    fill: '#F5F5FF',
  },
});
