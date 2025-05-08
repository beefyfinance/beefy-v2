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
    borderRadius: '0px',
    cursor: 'pointer',
    _first: {
      borderTopLeftRadius: '6px',
      borderBottomLeftRadius: '6px',
    },
    _last: {
      borderTopRightRadius: '6px',
      borderBottomRightRadius: '6px',
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
    md: {
      marginTop: '-32px',
      marginLeft: '-24px',
    },
  }),
  active: css.raw({
    backgroundColor: 'background.button',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      borderColor: 'background.button',
      borderStyle: 'solid',
      borderWidth: '2px', // =Buttons borderWidth
      borderRadius: 'inherit',
      top: '-1px', // -Buttons borderWidth
      left: '-1px',
      right: '-1px',
      bottom: '-1px',
      zIndex: '[1]',
    },
  }),
};
