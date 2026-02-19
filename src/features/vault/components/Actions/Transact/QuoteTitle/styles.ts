import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
  providersContainer: css.raw({
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  }),
  providerPill: css.raw({
    display: 'flex',
    gap: '6px',
    height: '24px',
    alignItems: 'center',
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
  providerIcon: css.raw({
    width: '20px',
    height: '20px',
    flexShrink: 0,
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
  }),
};
