import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
    padding: '24px',
    borderRadius: '12px 12px 0px 0px',
    backgroundColor: '#232743',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
      rowGap: '16px',
      padding: '16px',
    },
  },
  itemContainer: { display: 'flex', columnGap: '24px' },
  textContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    textTransform: 'uppercase' as const,
    fontWeight: 700,
  },
  value: {
    ...theme.typography.h3,
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  greenValue: {
    color: theme.palette.primary.main,
  },
  subValue: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  border: {
    height: '64px',
    width: '2px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.content,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  withTooltip: {
    textDecoration: 'underline 1px dotted',
    cursor: 'default' as const,
  },
});
