import { css } from '@repo/styles/css';

export const styles = {
  page: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBlock: '32px',
  }),
  contentContainer: css.raw({}),
  contentColumns: css.raw({
    display: 'grid',
    gridTemplateColumns: '100%',
    rowGap: '24px',
    columnGap: '24px',
    md: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(0,333fr)',
    },
  }),
  columnActions: css.raw({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '24px',
    '& > :first-child': {
      marginTop: '0',
    },
    md: {
      order: '1',
    },
  }),
  columnInfo: css.raw({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '24px',
    md: {
      marginTop: '0',
    },
  }),
};
