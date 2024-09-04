import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    color: theme.palette.text.dark,
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '4px',
    },
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.text.light,
    },
  },
  active: {
    color: theme.palette.text.light,
    '& $arrow': {
      transform: 'rotateX(180deg)',
    },
  },
  arrow: {
    height: '18px',
    width: '18px',
  },
  dropdown: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
    padding: `8px`,
    border: `2px solid ${theme.palette.background.contentDark}`,
    backgroundColor: theme.palette.background.searchInputBg,
    borderRadius: '4px',
    marginLeft: '-8px',
  },
  title: {},
  titleWithBadge: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
});
