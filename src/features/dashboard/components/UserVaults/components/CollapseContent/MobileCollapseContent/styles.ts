import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
  }),
  toggleContainer: css.raw({
    padding: '16px',
    backgroundColor: 'background.content.dark',
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '2px solid {colors.purpleDarkest}',
  }),
  buttonText: css.raw({
    textStyle: 'body.sm.medium',
  }),
};
