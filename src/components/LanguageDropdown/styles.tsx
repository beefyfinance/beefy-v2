export const styles = theme => ({
  languageCustom: {
    marginRight: theme.spacing(3),
    '& .MuiSelect-icon': {
      right: 0,
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiSelect-select': {
        textAlign: 'left',
        margin: '0',
      },
    },
  },
});
