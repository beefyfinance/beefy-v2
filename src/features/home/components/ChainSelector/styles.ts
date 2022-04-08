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
    '& $icon': {
      filter: 'grayscale(1)',
    },
  },
  selected: {
    backgroundColor: theme.palette.background.filters.inactive,
    '& $icon': {
      filter: 'none',
    },
  },
});
