export const styles = theme => ({
  container: {
    height: '44px',
    position: 'relative',
    '& .MuiSelect-select': {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.filters.inactive,
      fontWeight: 700,
      fontSize: 15,
      padding: '11px 29px 0 15px',
      border: props =>
        props.noBorder ? 'none' : `2px solid ${theme.palette.background.filters.outline}`,
      borderRadius: '8px',
      height: '29px',
      textAlign: 'right',
    },
    '& .MuiSelect-icon': {
      color: theme.palette.text.secondary,
      right: '12px',
    },
    '& .MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.text.secondary,
      position: 'absolute',
      top: '10px',
      left: '23px',
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiSelect-select': {
        textAlign: 'left',
      },
    },
  },
  select: {
    minWidth: props => (props.fullWidth ? '100%' : 210),
    [theme.breakpoints.down('sm')]: {
      minWidth: 'none',
    },
  },
  selectList: {
    color: theme.palette.text.disabled,
    border: `2px solid ${theme.palette.background.filters.outline}`,
    backgroundColor: theme.palette.background.filters.disabled,
    padding: '0px',
    margin: '0px',
    '& .label': {
      display: 'none',
    },
  },
  label: {
    color: theme.palette.text.disabled,
  },
  checkbox: {
    color: theme.palette.text.disabled,
    '&.MuiCheckbox-root': {
      color: theme.palette.text.disabled,
    },
    '&.Mui-checked': {
      color: theme.palette.text.primary,
    },
  },
});
