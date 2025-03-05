import { css } from '@repo/styles/css';

export const styles = {
  toggles: css.raw({
    display: 'flex',
    gap: '8px 16px',
    flexWrap: 'wrap',
  }),
  toggleCheckbox: css.raw({}),
  toggleIcon: css.raw({
    fontSize: '20px',
    width: '20px',
    height: '20px',
  }),
  toggleLabel: css.raw({
    textStyle: 'subline.sm',
    display: 'flex',
    gap: '8px',
    color: 'text.dark',
  }),
  toggleLabelLine: css.raw({
    height: '2px',
    width: '12px',
  }),
};
