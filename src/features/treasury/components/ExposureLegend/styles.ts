import { css } from '@repo/styles/css';

export const styles = {
  legendContainer: css.raw({
    display: 'flex',
    columnGap: '32px',
    flexWrap: 'wrap',
    rowGap: '8px',
    opacity: '0',
    animation: 'fadeInOut 500ms ease-in-out forwards',
    smDown: {
      flexDirection: 'column',
      columnGap: '16px',
    },
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
    smDown: {
      width: '14px',
    },
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
    smDown: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      columnGap: '8px',
      '& span': {
        marginLeft: '0px',
      },
    },
  }),
  uppercase: css.raw({
    textTransform: 'uppercase',
  }),
};
