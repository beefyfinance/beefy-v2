import { css } from '@repo/styles/css';

export const styles = {
  footer: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '8px 16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: 'background.content',
    mdDown: {
      padding: '8px 16px',
      flexWrap: 'wrap',
    },
  }),
  legendContainer: css.raw({
    textStyle: 'body.sm.medium',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    smDown: {
      flexWrap: 'wrap',
    },
  }),
  legendItem: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
  }),
  positionReferenceLine: css.raw({
    height: '2px',
    width: '12px',
    backgroundColor: 'graph.line.underlying',
    borderRadius: '4px',
  }),
  usdReferenceLine: css.raw({
    height: '2px',
    width: '12px',
    backgroundColor: 'graph.line.usd',
    borderRadius: '4px',
  }),
  holdReferenceLine: css.raw({
    height: '2px',
    width: '12px',
    backgroundColor: 'graph.line.heldUsd',
    borderRadius: '4px',
  }),
  tokenReferenceLine: css.raw({
    height: '2px',
    width: '12px',
    backgroundColor: 'red',
    borderRadius: '4px',
  }),
};
