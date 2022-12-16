import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '2px',
    marginBottom: '16px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  },
  title: {
    ...theme.typography.h3,
    padding: '16px 24px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    backgroundColor: '#242842',
    borderRadius: '8px 8px 0px 0px',
    '& img': {
      height: '32px',
    },
    '& div': {
      color: theme.palette.text.primary,
    },
    '& span': {
      color: theme.palette.text.disabled,
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  filter: {
    display: 'grid',
    padding: '16px 24px',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    backgroundColor: '#1B1E32',
    '& div': {
      ...theme.typography['subline-sm'],
      color: theme.palette.text.disabled,
      fontWeight: 700,
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  assetTypes: {
    backgroundColor: 'rgba(92, 112, 214, 0.4)',
    padding: '16px 24px',
    ...theme.typography['subline-sm'],
    color: '#ADB8EB',
    fontWeight: 700,
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  asset: {
    display: 'grid',
    padding: '16px 24px',
    backgroundColor: '#242842',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  assetFlex: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  subValue: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
  },
});
