import { css } from '@repo/styles/css';

export const styles = {
  switcher: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    columnGap: '12px',
    '&::before, &::after': {
      content: '""',
      display: 'block',
      background: 'background.content.light',
      height: '2px',
      width: '1px',
      flexShrink: '0',
      flexGrow: '1',
    },
  }),
  button: css.raw({
    width: '28',
    height: '28',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.light',
    background: 'bayOfMany',
    border: 'none',
    borderRadius: '50%',
    boxShadow: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
  }),
  icon: css.raw({
    width: '15',
    height: '13',
    fill: 'text.light',
  }),
};
