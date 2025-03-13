import { css } from '@repo/styles/css';

export const styles = {
  actions: css.raw({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: '8px',
    columnGap: '8px',
    marginLeft: 'auto',
    mdDown: {
      marginLeft: '0',
    },
  }),
  content: css.raw({
    gap: '32px',
  }),
  description: css.raw({
    whiteSpace: 'pre-line',
    color: 'text.middle',
  }),
  details: css.raw({
    display: 'flex',
    columnGap: '8px',
    justifyContent: 'space-between',
    mdDown: {
      flexDirection: 'column',
      rowGap: '8px',
    },
  }),
};
