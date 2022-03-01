export const styles = theme => ({
  languageCustom: {
    marginRight: theme.spacing(3),
    '& .MuiSelect-select': {
      padding: '12px 30px 0px 0px',
    },
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
