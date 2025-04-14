import { css } from '@repo/styles/css';

export const styles = {
  page: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBlock: '32px',
    sm: {
      gap: '24px',
    },
  }),
  contentColumns: css.raw({
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '12px',
    sm: {
      gap: '24px',
    },
    md: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(336px,333fr)',
    },
  }),
  columnActions: css.raw({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
    '& > :first-child': {
      marginTop: '0',
    },
    sm: {
      rowGap: '24px',
    },
    md: {
      order: '1',
    },
  }),
  columnInfo: css.raw({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
    sm: {
      rowGap: '24px',
    },
    md: {
      marginTop: '0',
    },
  }),
};
