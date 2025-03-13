import { css } from '@repo/styles/css';

export const styles = {
  shareButton: css.raw({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    '&:focus-visible, &.active': {
      outline: 'none',
      backgroundColor: 'bayOfMany',
    },
  }),
  mobileAlternative: css.raw({
    lgDown: {
      padding: '10px',
    },
  }),
  shareIcon: css.raw({
    flexShrink: '0',
    flexGrow: '0',
    fontSize: '16px',
  }),
  dropdown: css.raw({
    width: 'auto',
    zIndex: 'dropdown',
  }),
  dropdownInner: css.raw({
    backgroundColor: 'background.content',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  }),
  shareItem: css.raw({
    textStyle: 'body.medium',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'text.light',
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '0',
    margin: '0',
    padding: '0',
    minWidth: '0',
    flexShrink: '0',
    cursor: 'pointer',
    textAlign: 'left',
    '&:hover, &:focus-visible': {
      color: 'text.lightest',
    },
  }),
};
