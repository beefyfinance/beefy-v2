import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    ...theme.typography['body-lg-med'],
    lineHeight: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  navToken: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
    color: theme.palette.text.light,
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  navIcon: {
    display: 'block',
    height: '24px',
    width: '24px',
  },
  trigger: {
    cursor: 'pointer',
    userSelect: 'none' as const,
    position: 'relative' as const,
    width: '68px',
    height: '24px',
  },
  face: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    transformStyle: 'preserve-3d' as const,
    transform: 'rotateX(0deg)',
    transition: 'transform 0.5s ease-in-out',
  },
  current: {
    transform: 'rotateX(0deg)',
    zIndex: 2,
  },
  next: {
    transform: 'rotateX(90deg)',
    zIndex: 1,
  },
  hidden: {
    transform: 'rotateX(90deg)',
  },
  icon: {
    display: 'block',
    height: '24px',
    width: '24px',
  },
  tooltipContent: {
    background: '#232743',
    color: theme.palette.text.light,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    padding: '16px',
  },
  tooltipArrow: {
    color: '#232743',
  },
  grid: {},
  tooltipTokens: {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns:
      'min-content 1fr min-content min-content min-content min-content min-content',
    alignItems: 'center' as const,
  },
  tooltipToken: {},
  mooToken: {
    ...theme.typography['subline-lg'],
    textTransform: 'none' as const,
    marginTop: '12px',
    textAlign: 'center' as const,
    lineHeight: '1.1',
  },
  symbol: {
    ...theme.typography['body-lg-med'],
    paddingRight: '8px',
  },
  price: {},
  iconLink: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '4px',
    borderRadius: '4px',
    border: `none`,
    color: theme.palette.text.light,
    textDecoration: 'none',
    backgroundColor: '#363B63',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    '& $icon': {
      height: '20px',
      width: '20px',
      fill: 'currentColor',
    },
  },
});
