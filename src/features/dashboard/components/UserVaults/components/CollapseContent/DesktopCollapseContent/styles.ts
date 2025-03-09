import { css } from '@repo/styles/css';

export const styles = {
  collapseInner: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    backgroundColor: 'background.content.dark',
    padding: '16px 24px',
    lgDown: {
      padding: '16px',
    },
  }),
  toggleContainer: css.raw({
    padding: '16px',
    backgroundColor: 'background.content.dark',
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '2px solid {colors.purpleDarkest}',
  }),
};
