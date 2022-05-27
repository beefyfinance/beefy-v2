import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    paddingLeft: 0,
    paddingRight: 0,
    background: 'transparent',
    marginRight: theme.spacing(3),
    color: theme.palette.text.disabled,
    '& .MuiSelect-select': {
      // padding: '12px 30px 0px 0px',
    },
    '& .MuiSelect-icon': {
      // right: 0,
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiSelect-select': {
        // textAlign: 'left',
        // margin: '0',
      },
    },
  },
});
