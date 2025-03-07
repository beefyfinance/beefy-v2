import { css } from '@repo/styles/css';

export const styles = {
  poweredByLabel: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  poweredByLogos: css.raw({
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '24px',
  }),
};
