import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '16px',
    sm: {
      padding: '24px',
    },
  }),
  stakedInBoost: css.raw({
    marginBottom: '24px',
  }),
  notice: css.raw({
    marginBottom: '16px',
  }),
  labels: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  }),
  selectLabel: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  }),
  availableLabel: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    marginLeft: 'auto',
  }),
  availableLabelAmount: css.raw({
    textStyle: 'body.sm.medium',
    color: 'text.middle',
  }),
  zapIcon: css.raw({
    height: '12px',
  }),
  inputs: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '12px',
  }),
  links: css.raw({
    marginTop: '12px',
  }),
  quote: css.raw({
    marginTop: '24px',
  }),
  actions: css.raw({
    marginTop: '24px',
  }),
  fees: css.raw({
    marginTop: '24px',
  }),
};
