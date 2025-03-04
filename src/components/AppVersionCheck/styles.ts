import { css } from '@repo/styles/css';

export const styles = {
  positioner: css.raw({
    position: 'fixed',
    bottom: '0',
    left: '0',
    padding: '0 32px 32px 32px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 'version',
    pointerEvents: 'none',
    smDown: {
      padding: '0 16px 16px 16px',
    },
  }),
  alert: css.raw({
    textStyle: 'body',
    pointerEvents: 'auto',
    flex: '0 1 auto',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'background.content.dark',
    smDown: {
      flexDirection: 'column',
    },
  }),
  message: css.raw({
    flex: '1 1 auto',
  }),
  action: css.raw({
    flex: '0 0 auto',
    smDown: {
      width: '100%',
    },
  }),
  button: css.raw({
    smDown: {
      width: '100%',
    },
  }),
};
