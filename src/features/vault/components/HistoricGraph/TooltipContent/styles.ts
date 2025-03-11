import { css } from '@repo/styles/css';

export const styles = {
  content: css.raw({
    textStyle: 'body',
    color: 'text.lightest',
    padding: '12px 16px',
    minWidth: '250px',
    background: 'graphTooltipBackground',
    borderRadius: '8px',
    textAlign: 'left',
  }),
  timestamp: css.raw({
    marginBottom: '8px',
  }),
  grid: css.raw({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 16px',
  }),
  label: css.raw({
    color: 'text.dark',
  }),
  labelDetail: css.raw({
    textStyle: 'body.sm',
    lineHeight: '1',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'right',
  }),
  itemContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  }),
  rangeIndicator: css.raw({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'indicators.error',
  }),
  onRange: css.raw({
    backgroundColor: 'indicators.success',
  }),
};
