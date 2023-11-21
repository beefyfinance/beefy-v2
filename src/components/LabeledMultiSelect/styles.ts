import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    ...theme.typography['body-lg-med'],
    backgroundColor: '#262A40',
    border: `solid 2px ${theme.palette.background.v2.border}`,
    borderRadius: '8px',
    minWidth: 0,
    width: 'fit-content',
    color: theme.palette.text.secondary,
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
    color: theme.palette.text.disabled,
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
    fill: theme.palette.text.secondary,
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
    border: '2px solid #393F60',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.v2.contentLight,
    padding: `${8 - 2}px 0`,
    color: theme.palette.text.secondary,
    maxWidth: '100%',
    maxHeight: '100%',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    minHeight: '100px',
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
      color: '#FFF',
    },
    '&:active': {
      background: 'transparent',
      color: theme.palette.text.primary,
    },
  },
  dropdownItemSelected: {
    color: theme.palette.text.primary,
  },
});
