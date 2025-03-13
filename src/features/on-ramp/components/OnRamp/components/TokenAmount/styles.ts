import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    marginBottom: '8px',
  }),
  network: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: '12px',
  }),
  networkLabel: css.raw({
    marginRight: '8px',
  }),
  networkButton: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    margin: '0',
    padding: '0',
    cursor: 'pointer',
    '&:hover, &:focus-visible': {
      color: 'text.middle',
    },
  }),
  networkIcon: css.raw({
    marginRight: '8px',
    width: '20px',
    height: '20px',
  }),
};
