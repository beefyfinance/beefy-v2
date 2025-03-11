import { css } from '@repo/styles/css';

export const styles = {
  icon: css.raw({
    width: '24px',
    height: '24px',
    display: 'block',
    margin: '0 auto',
  }),
  button: css.raw({
    position: 'relative',
    background: 'transparent',
    boxShadow: 'none',
    flexGrow: '1',
    flexShrink: '0',
    padding: '6px 0px',
    border: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: '50%',
      left: '-1px',
      margin: '-10px 0 0 0',
      height: '20px',
      width: '1px',
      backgroundColor: 'bayOfMany',
    },
    '&:first-child::before': {
      display: 'none',
    },
  }),
  selected: css.raw({
    backgroundColor: 'background.content.dark',
  }),
  unselectedIcon: css.raw({
    '& .bg': {
      fill: 'chainIconUnselectedBackground',
    },
    '& .fg': {
      fill: 'background.body',
    },
  }),
  badge: css.raw({
    top: 'auto',
    right: 'auto',
    marginTop: '-12px',
    marginLeft: '4px',
    zIndex: 'badge',
  }),
};
