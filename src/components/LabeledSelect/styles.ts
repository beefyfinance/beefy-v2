import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  select: {
    backgroundColor: '#262A40',
    border: 'solid 2px #303550',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    lineHeight: '24px',
    minWidth: 0,
    width: 'fit-content',
    color: '#D0D0DA',
    padding: `${8 - 2}px ${16 - 2}px`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: 'none',
    textAlign: 'left' as const,
    '&:focus, &:hover': {
      outline: 'none',
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
    color: '#8A8EA8',
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
  },
  selectIcon: {
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: 'auto',
    fill: '#D0D0DA',
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
    zIndex: 1000,
    border: '2px solid #393F60',
    borderRadius: '8px',
    backgroundColor: '#303550',
    padding: `${8 - 2}px 0`,
    color: '#D0D0DA',
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: '24px',
    maxWidth: '100%',
    maxHeight: '100%',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    minHeight: '100px',
  },
  dropdownItem: {
    userSelect: 'none' as const,
    cursor: 'pointer',
    padding: `8px ${16 - 2}px`,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#FFF',
    },
    '&:focus, &:active': {
      background: 'transparent',
      color: '#F5F5FF',
    },
  },
  dropdownItemSelected: {
    background: 'transparent',
    color: '#F5F5FF',
  },
});
