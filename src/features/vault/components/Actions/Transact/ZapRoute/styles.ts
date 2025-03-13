import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    marginBottom: '8px',
  }),
  routeHolder: css.raw({
    borderRadius: '8px',
    border: 'solid 2px {colors.background.content.light}',
    overflow: 'hidden',
  }),
  routeHeader: css.raw({
    background: 'background.content.light',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
  }),
  routerHeaderClickable: css.raw({
    cursor: 'pointer',
  }),
  routeContent: css.raw({
    borderRadius: '0px 0px 8px 8px',
    padding: '16px',
  }),
  steps: css.raw({
    textStyle: 'body',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '12px 8px',
  }),
  stepNumber: css.raw({
    color: 'text.dark',
    flexShrink: '0',
    flexGrow: '0',
  }),
  stepContent: css.raw({
    color: 'text.middle',
  }),
};
