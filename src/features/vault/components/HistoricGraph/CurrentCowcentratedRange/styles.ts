import { css } from '@repo/styles/css';

export const styles = {
  cowcentratedHeader: css.raw({
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    smDown: {
      gridTemplateColumns: '1fr',
    },
  }),
  cowcentratedStat: css.raw({
    backgroundColor: 'background.content',
    padding: '16px',
    position: 'relative',
    sm: {
      padding: '16px 24px',
    },
  }),
  label: css.raw({
    textStyle: 'body.sm.medium',
    fontWeight: 'bold',
    color: 'text.dark',
    textTransform: 'uppercase',
  }),
  inRange: css.raw({
    color: 'indicators.success',
  }),
  outOfRange: css.raw({
    color: 'indicators.error',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    fontWeight: 'medium',
    color: 'text.lightest',
    '& span': {
      textStyle: 'body.sm.medium',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: 'text.dark',
    },
  }),
  fullWidth: css.raw({
    width: '100%',
    marginBottom: '1px',
  }),
  inverted: css.raw({
    position: 'absolute',
    top: '8',
    right: '8',
  }),
  invertButton: css.raw({
    color: 'text.lightest',
    padding: '0px 2px',
  }),
};
