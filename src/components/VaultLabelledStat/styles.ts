import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  labelText: {
    ...theme.typography['subline-sm'],
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
  subValue: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
  blurValue: {
    filter: 'blur(.5rem)',
  },
  boostedValue: {
    color: '#DB8332',
  },
  lineThroughValue: {
    textDecoration: 'line-through',
  },
  statContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
});
