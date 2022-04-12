import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  selector: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(2),
  },
  icon: {
    width: '24px',
    height: '24px',
    display: 'block',
    margin: '0 auto',
  },
  button: {
    background: 'transparent',
    outline: 'none',
    boxShadow: 'none',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: '68px',
    padding: `${12 - 2}px ${22 - 2}px`,
    border: `solid 2px ${theme.palette.background.filters.outline}`,
    borderRadius: '6px',
    cursor: 'pointer',
    '&:not($selected) $icon': {
      '& .bg': {
        fill: '#2E324C',
      },
      '& .fg': {
        fill: '#1B1E31',
      },
    },
  },
  selected: {
    backgroundColor: theme.palette.background.filters.inactive,
  },
  tooltip: {
    background: theme.palette.background.filters.outline,
    padding: '8px 12px',
    borderRadius: '4px',
    color: theme.palette.text.disabled,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 700,
    margin: '4px 0',
  },
});
