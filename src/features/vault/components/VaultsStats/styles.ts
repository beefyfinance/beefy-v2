import { css } from '@repo/styles/css';

export const styles = {
  boxes: css.raw({
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '12px',
    sm: {
      gap: '24px',
    },
    lg: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(0,333fr)',
    },
  }),
  stats: css.raw({
    display: 'grid',
    minHeight: '96px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    padding: '16px',
    columnGap: '48px',
    lg: {
      padding: '16px 24px',
    },
  }),
  statsInterest: css.raw({
    '& *': {
      textAlign: 'left',
    },
  }),
  statsDeposit: css.raw({
    '& *': {
      textAlign: 'left',
    },
    lg: {
      '& *': {
        textAlign: 'right',
        justifyContent: 'flex-end',
      },
    },
  }),
  stat: css.raw({
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      display: 'block',
      background: 'bayOfMany',
      width: '2px',
      height: '100%',
      left: '-25',
      top: '0',
    },
    '&:first-child::before': {
      content: 'none',
      display: 'none',
    },
  }),
};
