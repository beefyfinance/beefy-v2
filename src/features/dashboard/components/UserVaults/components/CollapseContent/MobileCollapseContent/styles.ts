import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '2px',
    marginTop: '2px',
  }),
  toggleContainer: css.raw({
    padding: '16px',
    backgroundColor: 'background.content.dark',
    display: 'flex',
    justifyContent: 'center',
  }),
  buttonText: css.raw({
    textStyle: 'body.sm.medium',
  }),
  select: css.raw({
    width: '100%',
    backgroundColor: 'background.content',
  }),
};
