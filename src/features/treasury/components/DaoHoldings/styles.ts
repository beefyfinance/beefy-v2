import { css } from '@repo/styles/css';

export const styles = {
  masonry: css.raw({
    display: 'flex',
    paddingBottom: '48px',
    gap: '16px',
    width: '100%',
  }),
  column: css.raw({
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '30%',
    flexGrow: '1',
    gap: '16px',
    '& > :last-child': {
      marginBottom: '0',
    },
  }),
};
