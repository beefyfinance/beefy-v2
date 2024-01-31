import type { Theme } from '@material-ui/core';

import cowLoader from '../../../../images//tech-loader.gif';

export const styles = (theme: Theme) => ({
  container: {
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
  embed: {
    margin: 0,
    padding: 0,
    border: 0,
    height: '750px',
    maxHeight: '100%',
    width: '682px',
    maxWidth: '100%',
    borderRadius: '12px',
    background: `${theme.palette.background.contentPrimary} url(${cowLoader}) center center no-repeat`,
  },
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
});
