export const styles = theme => ({
  listHeaderBtn: {
    fontSize: '10px',
    textAlign: 'right',
    textTransform: 'capitalize',
    padding: '0 25px 0 0',
    '&:hover': {
      background: 'transparent',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '12px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '14px',
    },
  },
  listHeaderBtnArrow: {
    position: 'absolute',
    right: '12px',
    top: '56%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '8px 5px 0',
    borderColor: 'transparent',
    transition: 'all 0.2s ease 0s',
    borderTopColor:
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
  },
  listHeaderBtnAsc: {
    borderWidth: '0 5px 8px',
    borderBottomColor:
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
  },
  listHeaderBtnDesc: {
    borderStyle: 'solid',
    borderWidth: '8px 5px 0',
    borderTopColor:
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
  },
});
