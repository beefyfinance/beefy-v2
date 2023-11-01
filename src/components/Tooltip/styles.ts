import type { Theme } from '@material-ui/core';

const arrowWidth = 12;
const arrowHeight = 8;

export const styles = (theme: Theme) => ({
  trigger: {
    display: 'inline-block',
  },
  arrow: {
    position: 'absolute' as const,
    zIndex: 15,
    color: '#fff',
    '&::before': {
      content: '""',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  content: {
    ...theme.typography['body-lg'],
    color: '#272B4A',
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '8px',
    textAlign: 'left' as const,
  },
  tooltip: {
    minWidth: `${arrowWidth * 3}px`,
    maxWidth: 'min(100%, 350px)',
    zIndex: 1301, // Modal is 1300
    '&[x-placement*="top"]': {
      marginBottom: `${arrowHeight}px`,
      '& $arrow': {
        bottom: `-${arrowHeight}px`,
        '&::before': {
          borderWidth: `${arrowHeight}px ${arrowWidth / 2}px 0 ${arrowWidth / 2}px`,
          borderColor: 'currentColor transparent transparent transparent',
        },
      },
    },
    '&[x-placement*="bottom"]': {
      marginTop: `${arrowHeight}px`,
      '& $arrow': {
        top: `-${arrowHeight}px`,
        '&::before': {
          borderWidth: `0 ${arrowWidth / 2}px ${arrowHeight}px ${arrowWidth / 2}px`,
          borderColor: 'transparent transparent currentColor transparent',
        },
      },
    },
    '&[x-placement*="left"]': {
      marginRight: `${arrowHeight}px`,
      '& $arrow': {
        right: `-${arrowHeight}px`,
        '&::before': {
          borderWidth: `${arrowWidth / 2}px 0 ${arrowWidth / 2}px ${arrowHeight}px`,
          borderColor: ' transparent transparent transparent currentColor',
        },
      },
    },
    '&[x-placement*="right"]': {
      marginLeft: `${arrowHeight}px`,
      '& $arrow': {
        left: `-${arrowHeight}px`,
        '&::before': {
          borderWidth: `${arrowWidth / 2}px ${arrowHeight}px ${arrowWidth / 2}px 0`,
          borderColor: 'transparent currentColor transparent transparent',
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
    ...theme.typography['body-lg-med'],
    color: '#272B4A',
  },
  basicContent: {
    ...theme.typography['body-lg'],
    color: '#272B4A',
  },
});
