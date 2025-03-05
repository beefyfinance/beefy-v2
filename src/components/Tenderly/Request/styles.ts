import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    marginBottom: '4px',
  }),
  calls: css.raw({
    display: 'grid',
    gridTemplateColumns: 'auto auto auto minmax(0, 1fr)',
    gap: '4px 8px',
  }),
  callHeader: css.raw({
    fontWeight: 'medium',
  }),
  callData: css.raw({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
};
