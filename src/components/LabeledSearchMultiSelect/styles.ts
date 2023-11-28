import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    ...theme.typography['body-lg-med'],
    backgroundColor: theme.palette.background.contentDark,
    border: `solid 2px ${theme.palette.background.contentPrimary}`,
    borderRadius: '8px',
    minWidth: 0,
    width: 'fit-content',
    color: theme.palette.text.middle,
    padding: `${8 - 2}px ${16 - 2}px`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: 'none',
    textAlign: 'left' as const,
    '&:hover': {
      boxShadow: 'none',
    },
  },
  selectCurrent: {
    display: 'flex',
    minWidth: 0,
  },
  selectLabel: {
    flexShrink: 0,
    flexGrow: 0,
    color: theme.palette.text.dark,
    marginRight: '4px',
  },
  selectValue: {
    flexShrink: 1,
    flexGrow: 0,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    marginRight: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: 'auto',
    fill: theme.palette.text.middle,
  },
  selectFullWidth: {
    width: '100%',
  },
  selectBorderless: {
    borderWidth: 0,
    padding: `8px 16px`,
  },
  selectOpen: {
    '& $selectIcon': {
      transform: 'rotateX(180deg)',
    },
  },
  dropdown: {
    ...theme.typography['body-lg-med'],
    zIndex: 1000,
    border: `2px solid ${theme.palette.background.contentLight}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.background.contentPrimary,
    padding: `${8 - 2}px 0`,
    color: theme.palette.text.middle,
    maxHeight: '350px',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    [theme.breakpoints.only('xs')]: {
      maxHeight: '250px',
    },
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    userSelect: 'none' as const,
    cursor: 'pointer',
    padding: `8px ${16 - 2}px`,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.16)',
      color: theme.palette.text.light,
    },
    '&:active': {
      background: 'transparent',
      color: theme.palette.text.light,
    },
  },
  dropdownItemSelected: {
    color: theme.palette.text.light,
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px 8px',
  },
  noResultItem: {
    padding: `8px ${16 - 2}px`,
  },
});
