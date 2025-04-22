import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    marginBottom: '0',
    display: 'flex',
  }),
  expiredBoostName: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  expiredBoostContainer: css.raw({
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    flexDirection: 'column',
  }),
  pastRewards: css.raw({
    padding: '0',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }),
};
