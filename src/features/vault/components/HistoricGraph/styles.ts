import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    flexDirection: 'column',
    alignItems: 'flex-start',
    sm: {
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
  }),
  content: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    padding: '0',
    backgroundColor: 'transparent',
  }),
  container: css.raw({
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  }),
};
