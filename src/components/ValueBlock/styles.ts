import { css } from '@repo/styles/css';

export const styles = {
  value: css.raw({
    textStyle: 'body.medium',
    margin: '0',
    padding: '0',
    whiteSpace: 'nowrap',
    lgDown: {
      textAlign: 'left',
    },
  }),
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    textAlign: 'left',
    md: {
      textAlign: 'center',
    },
  }),
  price: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    whiteSpace: 'nowrap',
  }),
  blurred: css.raw({
    filter: 'blur(.5rem)',
  }),
  tooltipLabel: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  tooltipIcon: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.dark',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginLeft: '4px',
  }),
  noTextContentLoader: css.raw({
    paddingTop: '3px',
  }),
};
