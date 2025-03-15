import { css } from '@repo/styles/css';

export const styles = {
  holder: css.raw({
    padding: '16px',
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    sm: {
      columnGap: '48px',
      padding: '24px',
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
