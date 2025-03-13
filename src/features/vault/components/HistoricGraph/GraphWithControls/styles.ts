import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  }),
  graph: css.raw({
    backgroundColor: 'background.content',
  }),
  footer: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: 'background.content',
    mdDown: {
      padding: '8px 16px',
    },
  }),
  legend: css.raw({
    display: 'flex',
    gap: '24px',
  }),
  legendItem: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  line: css.raw({
    height: '2px',
    width: '12px',
    backgroundColor: 'white',
  }),
  range: css.raw({
    height: '12px',
    width: '12px',
    backgroundColor: 'graphLegendRange',
  }),
};
