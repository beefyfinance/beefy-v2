import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    sm: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    smDown: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
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
