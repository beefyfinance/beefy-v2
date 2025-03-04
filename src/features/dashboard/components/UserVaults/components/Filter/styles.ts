import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    backgroundColor: 'background.content.dark',
    borderRadius: '8px 8px 0px 0px',
    padding: '16px',
    display: 'grid',
    width: '100%',
    columnGap: '8px',
    backgroundClip: 'padding-box',
    borderBottom: 'solid 2px {colors.background.content.dark}',
    gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
    mdDown: {
      gridTemplateColumns: 'minmax(0, 60fr) minmax(0, 40fr)',
    },
  }),
  sortColumns: css.raw({
    display: 'grid',
    width: '100%',
    columnGap: '8px',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    md: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    lg: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  }),
  hideSm: css.raw({
    display: 'none',
    md: {
      display: 'flex',
    },
  }),
  hideMd: css.raw({
    display: 'none',
    lg: {
      display: 'flex',
    },
  }),
  searchWidth: css.raw({
    lg: {
      maxWidth: '75%',
    },
  }),
};
