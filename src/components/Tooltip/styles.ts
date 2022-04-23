import { Theme } from '@material-ui/core/styles';

const borderWidth = 2;
const arrowWidth = 24;
const arrowHeight = 12;

export const styles = (theme: Theme) => ({
  trigger: {
    display: 'inline-block',
  },
  arrow: {
    position: 'absolute' as const,
    zIndex: 15,
    '&::before': {
      content: '""',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  content: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    color: '#272B4A',
    padding: '16px',
    background: '#fff',
    border: `${borderWidth}px solid #E5E5E5`,
    filter: 'drop-shadow(0px 0px 40px #0A0F2B)',
    borderRadius: '10px',
    maxWidth: '350px',
    minWidth: '250px',
    textAlign: 'left' as const,
  },
  tooltip: {
    zIndex: 1000,
    '&[x-placement*="top"]': {
      marginBottom: `${arrowHeight - borderWidth}px`,
      '& $arrow': {
        bottom: `-${arrowHeight - borderWidth}px`,
        '&::before': {
          borderWidth: `${arrowHeight}px ${arrowWidth / 2}px 0 ${arrowWidth / 2}px`,
          borderColor: '#fff transparent transparent transparent',
        },
      },
    },
    '&[x-placement*="bottom"]': {
      marginTop: `${arrowHeight - borderWidth}px`,
      '& $arrow': {
        top: `-${arrowHeight - borderWidth}px`,
        '&::before': {
          borderWidth: `0 ${arrowWidth / 2}px ${arrowHeight}px ${arrowWidth / 2}px`,
          borderColor: 'transparent transparent #fff transparent',
        },
      },
    },
    '&[x-placement*="left"]': {
      marginRight: `${arrowHeight - borderWidth}px`,
      '& $arrow': {
        right: `-${arrowHeight - borderWidth}px`,
        '&::before': {
          borderWidth: `${arrowWidth / 2}px 0 ${arrowWidth / 2}px ${arrowHeight}px`,
          borderColor: ' transparent transparent transparent #fff',
        },
      },
    },
    '&[x-placement*="right"]': {
      marginLeft: `${arrowHeight - borderWidth}px`,
      '& $arrow': {
        left: `-${arrowHeight - borderWidth}px`,
        '&::before': {
          borderWidth: `${arrowWidth / 2}px ${arrowHeight}px ${arrowWidth / 2}px 0`,
          borderColor: 'transparent #fff transparent transparent',
        },
      },
    },
    '&[x-placement*="top"], &[x-placement*="bottom"]': {
      '&[x-placement*="-start"] $content': {
        marginLeft: `-${arrowWidth / 2}px`,
      },
      '&[x-placement*="-end"] $content': {
        marginRight: `-${arrowWidth / 2}px`,
      },
    },
    '&[x-placement*="left"], &[x-placement*="right"]': {
      '&[x-placement*="-start"] $content': {
        marginTop: `-${arrowWidth / 2}px`,
      },
      '&[x-placement*="-end"] $content': {
        marginBottom: `-${arrowWidth / 2}px`,
      },
    },
  },
  basicTitle: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '18px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: '#272B4A',
    marginBottom: '8px',
  },
  basicContent: {},
});
