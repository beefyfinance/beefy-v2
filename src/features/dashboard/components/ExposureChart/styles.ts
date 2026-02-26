import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '16px 24px',
    borderRadius: '8px',
    backgroundColor: 'background.content',
    lgDown: {
      padding: '16px',
    },
    mdDown: {
      padding: '0px',
    },
  }),
  infoContainer: css.raw({
    display: 'flex',
    columnGap: '24px',
    justifyContent: 'center',
    alignItems: 'center',
    '& .recharts-surface:focus': {
      outline: 'none',
    },
  }),
  title: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    marginBottom: '24px',
  }),
};
