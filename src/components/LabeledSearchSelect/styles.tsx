import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#262A40',
    borderRadius: '8px',
    padding: `${8 - 2}px ${16 - 2}px`,
    border: 'solid 2px #303550',
  },
  inputWrapper: {
    ...theme.typography['body-lg-med'],
    flexGrow: 1,
    backgroundColor: '#262A40',
    gap: '4px',
    color: theme.palette.text.dark,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& input': {
      ...theme.typography['body-lg-med'],
      backgroundColor: '#262A40',
      color: theme.palette.text.secondary,
      height: '24px',
      boxSizing: ' border-box',
      padding: ' 4px 6px',
      width: 0,
      minWidth: '30px',
      flexGrow: 1,
      border: 0,
      margin: 0,
      outline: 0,
    },
  },
  dropdown: {
    ...theme.typography['body-lg-med'],
    zIndex: 1000,
    position: 'absolute' as const,
    border: '2px solid #393F60',
    borderRadius: '8px',
    backgroundColor: '#303550',
    padding: `${8 - 2}px 0`,
    color: '#D0D0DA',
    overflowY: 'auto' as const,
    maxHeight: '250px',
    width: '300px',
    margin: '4px 0 0 ',
  },
  dropdownItem: {
    userSelect: 'none' as const,
    cursor: 'pointer',
    padding: `8px ${16 - 2}px`,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#FFF',
    },
    '&:active': {
      background: 'transparent',
      color: '#F5F5FF',
    },
  },
  dropdownItemSelected: {
    background: 'transparent',
    color: '#F5F5FF',
  },

  value: {
    color: theme.palette.text.secondary,
  },
  selectIcon: {
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: 'auto',
    fill: 'currentColor',
  },
  openIcon: {
    transform: 'rotateX(180deg)',
  },
  inputHided: {
    '& input': {
      color: 'transparent',
    },
  },
});
