import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    padding: '24px',
    backgroundColor: theme.palette.background.dashboard.cardBg,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateColums: '1fr',
    rowGap: '16px',
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
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
    borderRadius: '80px',
    backgroundColor: '#3D5CF5',
  },
  legendContainer: {
    display: 'flex',
    columnGap: '40px',
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
    color: '#D0D0DA',
    textTransform: 'capitalize' as const,
    '& span': {
      ...theme.typography['body-sm'],
      color: '#999CB3',
      marginLeft: '4px',
    },
  },
});
