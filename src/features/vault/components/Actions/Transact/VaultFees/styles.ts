import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: 'background.content.light',
  }),
  transactionFees: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(max-content, 1fr) minmax(min-content, 1fr)',
    gap: '4px',
  }),
  performanceFees: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    marginTop: '12px',
  }),
  tooltipTrigger: css.raw({
    width: '16px',
    height: '16px',
    margin: '0',
    verticalAlign: 'middle',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  }),
};
