import { css } from '@repo/styles/css';

export const styles = {
  withTooltip: css.raw({
    display: 'inline-block',
    textDecoration: 'underline 1px dotted',
    cursor: 'default',
  }),
  withOnClick: css.raw({
    '&:hover': {
      cursor: 'pointer',
    },
  }),
};
