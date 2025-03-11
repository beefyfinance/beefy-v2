import { css } from '@repo/styles/css';

export const styles = {
  topBar: css.raw({
    height: '10px',
    borderRadius: '4px 4px 0 0',
    backgroundColor: 'modalProgressBarBackground',
    flexShrink: '0',
    flexGrow: '0',
  }),
  bar: css.raw({
    margin: 0,
    height: '100%',
    transitionTimingFunction: 'ease-in',
    transition: '0.3s',
  }),
  progressBar: css.raw({
    borderRadius: '4px 0 0 0',
    backgroundColor: 'green',
  }),
  errorBar: css.raw({
    backgroundColor: 'red',
    borderRadius: '4px 4px 0 0',
  }),
  successBar: css.raw({
    backgroundColor: 'green',
    borderRadius: '4px 4px 0 0',
  }),
};
