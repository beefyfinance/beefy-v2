import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    marginBottom: '0',
    display: 'flex',
  }),
  expiredBoostName: css.raw({
    textStyle: 'body.med',
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
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  value: css.raw({
    textStyle: 'body.med',
    color: 'text.middle',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }),
};
