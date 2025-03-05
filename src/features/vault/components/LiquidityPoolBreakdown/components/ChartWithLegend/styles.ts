import { css } from '@repo/styles/css';

export const styles = {
  holder: css.raw({
    padding: '24px',
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    sm: {
      columnGap: '48px',
    },
    lg: {
      flexDirection: 'column',
      borderRight: 'solid 2px {colors.bayOfMany}',
    },
  }),
  legend: css.raw({
    lg: {
      marginTop: '24px',
    },
  }),
};
