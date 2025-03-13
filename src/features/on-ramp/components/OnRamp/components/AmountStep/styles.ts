import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
  }),
  text: css.raw({
    marginTop: '24px',
  }),
  input: css.raw({
    order: '1',
  }),
  switcher: css.raw({
    margin: '12px 0',
    order: '2',
  }),
  output: css.raw({
    order: '3',
  }),
  continue: css.raw({
    marginTop: 'auto',
    order: '4',
  }),
};
