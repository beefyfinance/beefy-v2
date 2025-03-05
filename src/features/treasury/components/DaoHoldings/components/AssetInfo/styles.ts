import { css } from '@repo/styles/css';

export const styles = {
  asset: css.raw({
    display: 'grid',
    padding: '16px 24px',
    backgroundColor: 'background.content',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    lgDown: {
      padding: '16px',
    },
  }),
  assetFlex: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    justifyContent: 'flex-end',
  }),
  subValue: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    display: 'flex',
    justifyContent: 'flex-end',
  }),
};
