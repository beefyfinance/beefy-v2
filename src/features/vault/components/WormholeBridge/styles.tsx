import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  positioner: {
    position: 'absolute' as const,
    outline: 'none',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  sizer: {
    position: 'relative' as const,
    height: '750px',
    maxHeight: '100%',
    width: '682px',
    maxWidth: '100%',
    borderRadius: '12px',
  },
  embed: {
    position: 'relative' as const,
    margin: 0,
    padding: 0,
    border: 0,
    height: '100%',
    width: '100%',
    borderRadius: '12px',
    zIndex: 1,
    opacity: 1,
    transition: 'opacity 0.2s ease-in-out',
    '&$loading': {
      opacity: 0,
    },
  },
  loader: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    userSelect: 'none' as const,
    pointerEvents: 'none' as const,
    background: theme.palette.background.contentPrimary,
    borderRadius: '12px',
  },
  loading: {},
  header: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    padding: '24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.contentDark,
  },
  socials: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
  text: {
    color: theme.palette.text.middle,
    marginBottom: '16px',
  },
  bridge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px 8px',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row' as const,
    },
  },
  eligible: {
    flexGrow: 1,
  },
  rewardToken: {
    marginTop: '24px',
  },
  boostedBy: {
    ...theme.typography['h2'],
    margin: 0,
    color: theme.palette.background.vaults.boost,
    flexGrow: 1,
    '& span': {
      color: theme.palette.text.light,
    },
  },
  button: {
    ...theme.typography['body-lg'],
    padding: '2px 8px',
    borderRadius: '4px',
  },
  icon: {
    marginLeft: '4px',
    '&:hover': {
      fill: theme.palette.text.light,
    },
  },
  link: {
    color: 'inherit',
    textDecoration: 'underline',
  },
  notice: {
    ...theme.typography['body-sm'],
    borderRadius: '4px',
    backgroundColor: theme.palette.background.contentLight,
    padding: '4px',
    textAlign: 'center' as const,
    marginBottom: '8px',
    // display: 'none' as const,
  },
});
