import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '8px',
    display: 'grid',
    rowGap: '16px',
    [theme.breakpoints.only('md')]: {
      height: '120px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
  },
  bar: {
    height: '12px',
    width: '100%',
    backgroundColor: '#C2D65C',
    borderRadius: '80px',
  },
  stableBar: {
    height: '100%',
    width: props => props.stablesPercentage,
    borderRadius: props => (props.stablesPercentage === '100%' ? '80px' : '80px 0px 0px 80px'),
    borderRight: props =>
      props.stablesPercentage === '100%'
        ? 'none'
        : `2px solid ${theme.palette.background.contentPrimary}`,
    backgroundColor: '#3D5CF5',
  },
  legendContainer: {
    display: 'flex',
    columnGap: '32px',
  },
  legendItem: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  square: {
    height: '12px',
    width: '12px',
    borderRadius: '2px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.middle,
    textTransform: 'capitalize' as const,
    '& span': {
      ...theme.typography['body-sm'],
      color: theme.palette.text.dark,
      marginLeft: '4px',
    },
  },
});
