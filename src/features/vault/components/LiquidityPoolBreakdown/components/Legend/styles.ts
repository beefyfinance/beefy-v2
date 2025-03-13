import { css } from '@repo/styles/css';

export const styles = {
  holder: css.raw({
    textStyle: 'subline.sm',
    color: 'text.middle',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    columnGap: '8px',
    justifyContent: 'center',
    sm: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    lg: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  }),
  item: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
    marginLeft: '8px',
    marginRight: '4px',
  }),
  key: css.raw({
    width: '4px',
    height: '24px',
    borderRadius: '2px',
  }),
};
