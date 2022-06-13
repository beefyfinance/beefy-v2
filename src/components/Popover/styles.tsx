import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  popover: {
    padding: '16px',
    background: theme.palette.type === 'dark' ? '#FFF' : '#272B4A',
    border: theme.palette.type === 'dark' ? '2px solid #E5E5E5' : '2px solid #A69885',
    filter: 'drop-shadow(0px 0px 40px #0A0F2B)',
    borderRadius: '10px',
    margin: '15px auto',
    maxWidth: '350px',
    minWidth: '250px',
    textAlign: 'left' as const,
    color: theme.palette.type === 'dark' ? '#565B81' : '#A69885',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8585A6',
    '& .MuiSvgIcon-root': {
      fontSize: 'inherit',
    },
    '&:hover': {
      cursor: 'pointer',
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.type === 'dark' ? '#272B4A' : '#A69885',
    marginBottom: '8px',
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
    position: 'absolute' as const,
    '&:before': {
      position: 'absolute' as const,
      content: '""',
      height: 0,
      width: 0,
      zIndex: 15,
      borderStyle: 'solid',
    },
    '&:after': {
      position: 'absolute' as const,
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
            ? '#FFF transparent transparent transparent'
            : 'transparent transparent transparent transparent',
      },
      '&:after': {
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? 'transparent transparent transparent transparent'
            : 'transparent transparent #A69885 transparent',
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
            ? 'transparent transparent #FFF transparent'
            : 'transparent transparent transparent transparent',
      },
      '&:after': {
        borderWidth: '12px',
        borderColor:
          theme.palette.type === 'dark'
            ? 'transparent transparent transparent transparent'
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
