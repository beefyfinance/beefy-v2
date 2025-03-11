import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    width: '100%',
    padding: '16px 24px',
    backgroundColor: 'background.content',
    borderRadius: '8px',
    display: 'grid',
    rowGap: '16px',
    mdOnly: {
      height: '120px',
    },
    lgDown: {
      padding: '16px',
    },
  }),
  title: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  bar: css.raw({
    height: '12px',
    width: '100%',
    backgroundColor: 'exposureOther',
    borderRadius: '80px',
  }),
  stableBar: css.raw({
    height: '100%',
    borderRadius: '80px 0px 0px 80px',
    borderRight: '2px solid {background.content}',
    backgroundColor: 'exposureStable',
  }),
  stableBarComplete: css.raw({
    borderRadius: '80px',
    borderRight: 'none',
  }),
  legendContainer: css.raw({
    display: 'flex',
    columnGap: '32px',
  }),
  legendItem: css.raw({
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
  square: css.raw({
    height: '12px',
    width: '12px',
    borderRadius: '2px',
  }),
  label: css.raw({
    textStyle: 'body.sm.medium',
    color: 'text.middle',
    textTransform: 'capitalize',
    '& span': {
      textStyle: 'body.sm',
      color: 'text.dark',
      marginLeft: '4px',
    },
  }),
};
