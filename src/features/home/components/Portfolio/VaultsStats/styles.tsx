export const styles = theme => ({
  userStats: {
    display: 'flex',
    '& div:last-child': {
      marginRight: '0',
    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
    },
  },
  stat: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: '32px',
    [theme.breakpoints.down('sm')]: {
      minWidth: '140px',
      margin: 0,
    },
  },
  value: {
    ...theme.typography['h2'],
    color: theme.palette.text.light,
  },
  label: {
    ...theme.typography['subline-lg'],
    display: 'inline-flex',
    color: theme.palette.text.dark,
  },
  obscured: {
    color: '#424866',
  },
  labelWithIcon: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
    },
  },
  icon: {
    marginLeft: '4px',
    cursor: 'pointer',
    display: 'block',
  },
});
