import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    textStyle: 'body.medium',
    position: 'relative',
    color: 'text.middle',
    background: 'background.content.dark',
    padding: '16px 24px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '0',
      right: '0',
      height: '2px',
      background: 'bayOfMany',
    },
  }),
  backButton: css.raw({
    margin: '0',
    padding: '0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: 'bayOfMany',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    color: 'text.light',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  backIcon: css.raw({
    fill: 'text.light',
    width: '12px',
    height: '9px',
  }),
};
