import { css } from '@repo/styles/css';

export const styles = {
  select: css.raw({
    padding: '24px 0 0 0',
    height: '400px', // TODO
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  }),
  listContainer: css.raw({
    flexGrow: '1',
    height: '100%',
  }),
  list: css.raw({
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    overflowY: 'auto',
  }),
};
