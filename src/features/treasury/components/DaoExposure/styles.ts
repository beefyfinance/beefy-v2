import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    width: '100%',
    padding: '16px',
    backgroundColor: 'background.content',
    borderRadius: '8px',
    display: 'grid',
    mdOnly: {
      height: '120px',
    },
    lg: {
      padding: '16px 24px',
      borderRadius: '20px',
    },
  }),
  option: css.raw({
    textStyle: 'body.medium',
    color: 'text.dark',
    whiteSpace: 'nowrap',
    '&:hover': {
      color: 'text.light',
      cursor: 'pointer',
    },
  }),
  active: css.raw({
    color: 'text.light',
  }),
  optionsContainer: css.raw({
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    mdDown: {
      marginBottom: '24px',
    },
  }),
};
