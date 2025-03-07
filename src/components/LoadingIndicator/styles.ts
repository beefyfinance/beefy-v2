import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'inherit',
  }),
  icon: css.raw({
    marginBottom: '16px',
  }),
  text: css.raw({
    textStyle: 'subline',
    color: 'text.dark',
  }),
};
