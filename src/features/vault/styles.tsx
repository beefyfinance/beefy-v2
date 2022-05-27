import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaultContainer: {
    padding: '42px 0px 16px 0px',
  },
  contentContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  titleHolder: {
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'center',
    flexGrow: 1,
    [theme.breakpoints.up('lg')]: {
      marginBottom: '0',
    },
  },
  title: {
    ...theme.typography['h1'],
    color: theme.palette.text.secondary,
    margin: '0 0 0 12px',
  },
  dw: {
    backgroundColor: '#272B4A',
    borderRadius: '12px',
  },
  columnActions: {
    '& > :first-child': {
      marginTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  columnInfo: {
    marginTop: '-24px',
    '& > :first-child': {
      marginTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      marginTop: 0,
    },
  },
  tabs: {
    backgroundColor: theme.palette.background.vaults.inactive,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    '& .MuiButton-root': {
      color: theme.palette.text.disabled,
      background: 'none',
      width: '50%',
      padding: 0,
      margin: 0,
      height: '60px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      '&:hover': {
        background: 'none',
      },
    },
  },
  selected: {
    color: `${theme.palette.text.primary} !important`,
    borderBottom: `solid 2px ${theme.palette.text.disabled}`,
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
    rowGap: '4px',
    columnGap: '4px',
    '& img': {
      height: '24px',
      marginRight: '4px',
    },
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  platformContainer: {
    display: 'flex',
    marginTop: '8px',
    rowGap: '24px',
    columnGap: '24px',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  platformLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.primary,
      textTransform: 'uppercase' as const,
    },
  },
  header: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  retirePauseReason: {
    marginBottom: '24px',
  },
});
