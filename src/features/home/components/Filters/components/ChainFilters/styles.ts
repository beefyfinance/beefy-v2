import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  selector: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    columnGap: '0',
    rowGap: '16px',
    width: 'fit-content',
    border: `solid 2px ${theme.palette.background.contentPrimary}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.background.contentDark,
  },
  icon: {
    width: '24px',
    height: '24px',
    display: 'block',
    margin: '0 auto',
  },
  button: {
    position: 'relative' as const,
    background: 'transparent',
    boxShadow: 'none',
    flexGrow: 1,
    flexShrink: 0,
    padding: `6px 0px`,
    border: `0`,
    borderRadius: '6px',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute' as const,
      top: '50%',
      left: '0',
      margin: `${20 / -2}px 0 0 0`,
      height: '20px',
      width: '1px',
      backgroundColor: theme.palette.background.border,
    },
    '&:first-child::before': {
      display: 'none',
    },
    '&:not($selected) $icon': {
      '& .bg': {
        fill: '#2E324C',
      },
      '& .fg': {
        fill: theme.palette.background.appBg,
      },
    },
  },
  selected: {
    backgroundColor: theme.palette.background.contentDark,
  },
  tooltip: {
    ...theme.typography['body-lg-med'],
    background: theme.palette.background.contentLight,
    padding: '8px 12px',
    borderRadius: '4px',
    color: theme.palette.text.dark,
    margin: '4px 0',
  },
  iconWithChain: {
    display: 'flex',
    alignItems: 'center',
  },
  iconWithChainIcon: {
    marginRight: '4px',
  },
  iconWithChainSelected: {
    '& $iconWithChainIcon': {
      marginRight: '4px',
    },
  },
  badge: {
    top: 'auto',
    right: 'auto',
    marginTop: '-12px',
    marginLeft: '4px',
  },
  badgeMobile: {
    position: 'static' as const,
    transform: 'none',
    top: '0',
    right: '0',
    marginLeft: '8px',
  },
});
