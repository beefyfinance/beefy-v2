const styles = theme => ({
  popover: {
    padding: '15px',
    background: theme.palette.type === 'dark' ? ' #272B4A' : '#fff',
    border: theme.palette.type === 'dark' ? '3px solid #484F7F' : '3px solid #A69885',
    filter: 'drop-shadow(0px 0px 40px #0A0F2B)',
    borderRadius: '15px',
    margin: '15px auto',
    maxWidth: '350px',
    color: theme.palette.type === 'dark' ? '#FFF' : '#A69885',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.type === 'dark' ? ' #272B4A' : '#6E675D',
    color: '#fff',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  dot: {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    background: theme.palette.type === 'dark' ? '#484F7F' : '#A69885',
    color: '#fff',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  title: {
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
    background: theme.palette.type === 'dark' ? '#272B4A' : '#fff',
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '18px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: theme.palette.type === 'dark' ? '#FFFFFF' : '#A69885',
  },
  divider: {
    opacity: '0.4',
    border: '1px solid #8585A6',
    margin: '10px auto',
  },
  size_sm: {
    width: '18px',
    height: '18px',
  },
  size_md: {
    width: '20px',
    height: '20px',
  },
  size_lg: {
    width: '24px',
    height: '24px',
  },
  arrow: {
    position: 'absolute',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: 0,
      width: 0,
      zIndex: 15,
      borderStyle: 'solid',
    },
    '&:after': {
      position: 'absolute',
      content: '""',
      height: 0,
      width: 0,
      zIndex: 14,
      borderStyle: 'solid',
    },
  },
  popper: {
    zIndex: 10,
    '&[x-placement*="end"] .popover': {
      marginRight: -30,
    },
    '&[x-placement*="start"] .popover': {
      marginLeft: -30,
    },
    '&[x-placement*="top"] span': {
      bottom: 16,
      width: 0,
      height: 0,
      '&:before': {
        marginTop: '-4px',
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? '#272B4A transparent transparent transparent'
            : 'transparent transparent transparent transparent',
      },
      '&:after': {
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? '#484F7F transparent transparent transparent'
            : '#A69885 transparent transparent transparent',
      },
    },
    '&[x-placement*="bottom"] span': {
      top: -8,
      width: 0,
      height: 0,
      '&:before': {
        top: 4,
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? 'transparent transparent #272B4A transparent'
            : 'transparent transparent transparent transparent',
      },
      '&:after': {
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? 'transparent transparent #484F7F transparent'
            : 'transparent transparent #A69885 transparent',
      },
    },
    '&[x-placement*="end"] span': {
      '&:before': {
        right: '-12px',
      },
      '&:after': {
        right: '-12px',
      },
    },
    '&[x-placement*="start"] span': {
      '&:before': {
        left: '-12px',
      },
      '&:after': {
        left: '-12px',
      },
    },
  },
});

export default styles;
