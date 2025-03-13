import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: '8px',
  }),
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  button: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    color: 'text.middle',
    background: 'bayOfMany',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    margin: '0',
    boxShadow: 'none',
    outline: 'none',
  }),
  clickable: css.raw({
    cursor: 'pointer',
  }),
  unclickable: css.raw({
    cursor: 'default',
    pointerEvents: 'none',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    marginRight: '8px',
  }),
  iconLoading: css.raw({
    background: 'onRampIconLoading',
  }),
  provider: css.raw({
    marginRight: '8px',
  }),
  rate: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    marginRight: '8px',
  }),
  arrow: css.raw({
    marginLeft: 'auto',
    color: 'text.middle',
    height: '24px',
  }),
};
