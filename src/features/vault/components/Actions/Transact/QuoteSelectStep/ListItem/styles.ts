import { css } from '@repo/styles/css';

export const styles = {
  item: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: 'text.dark',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: 'text.middle',
      '& > .item-arrow': {
        color: 'white',
      },
    },
  }),
  provider: css.raw({
    marginRight: 'auto',
  }),
  output: css.raw({}),
  arrow: css.raw({
    marginLeft: '12px',
    color: 'text.middle',
    height: '24px',
  }),
};
