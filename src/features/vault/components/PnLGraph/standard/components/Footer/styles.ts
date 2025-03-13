import { css } from '@repo/styles/css';

export const styles = {
  footer: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '16px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: 'background.content',
    mdDown: {
      padding: '8px 16px',
    },
  }),
};
