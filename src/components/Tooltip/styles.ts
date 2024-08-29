import type { Theme } from '@material-ui/core';

const arrowWidth = 12;
const arrowHeight = 8;

export const styles = (theme: Theme) => ({
  trigger: {
    '--tooltip-content-padding': '16px',
    '--tooltip-content-vertical-gap': '8px',
    '--tooltip-content-horizontal-gap': '24px',
    '--tooltip-content-border-radius': '8px',
    display: 'inline-flex',
  },
  arrow: {
    position: 'absolute' as const,
    zIndex: 15,
    color: theme.palette.background.contentDark,
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
    color: theme.palette.text.primary,
    background: theme.palette.background.contentDark,
    padding: 'var(--tooltip-content-padding, 16px)',
    borderRadius: 'var(--tooltip-content-border-radius, 8px)',
    textAlign: 'left' as const,
  },
  tooltip: {
    minWidth: `${arrowWidth * 3}px`,
    maxWidth: 'min(calc(100% - 16px), 440px)',
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
    color: theme.palette.text.tooltip.title,
    '& + $basicContent': {
      marginTop: 'var(--tooltip-content-vertical-gap, 8px)',
    },
  },
  basicContent: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.tooltip.content,
  },
  icon: {
    color: 'var(--tooltip-icon-color, inherit)',
    fontSize: 'var(--tooltip-icon-size, 20px)',
    width: 'var(--tooltip-icon-size, 20px)',
    height: 'var(--tooltip-icon-size, 20px)',
    '& .MuiSvgIcon-root': {
      fontSize: 'inherit',
      display: 'block',
    },
  },
  compact: {
    '--tooltip-content-padding': '8px',
    '--tooltip-content-vertical-gap': '4px',
    '--tooltip-content-horizontal-gap': '12px',
    '--tooltip-content-border-radius': '4px',
  },
});
