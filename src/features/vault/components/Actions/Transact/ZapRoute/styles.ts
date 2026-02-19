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
    padding: '8px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  routerHeaderClickable: css.raw({
    cursor: 'pointer',
  }),
  routeContent: css.raw({
    borderRadius: '0px 0px 8px 8px',
    padding: '4px 2px 8px',
  }),
  steps: css.raw({
    textStyle: 'body',
    display: 'flex',
    flexDirection: 'column',
  }),
  stepRow: css.raw({
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '8px 12px 8px 8px',
  }),
  stepStatusWrapper: css.raw({
    display: 'flex',
    alignItems: 'center',
    paddingTop: '2px',
    flexShrink: 0,
  }),
  stepContent: css.raw({
    flex: '1 1 auto',
    color: 'text.middle',
    minWidth: '0',
    lineHeight: '20px',
  }),
  statusBase: css.raw({
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  statusList: css.raw({
    background: '#1c1e32',
    textStyle: 'sm',
    color: 'text.dark',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    textAlign: 'center',
  }),
  statusFinished: css.raw({
    background: 'green.70-56a',
  }),
  statusInProgress: css.raw({
    background: 'gold.20',
  }),
  statusNotStarted: css.raw({
    background: 'darkBlue.30',
  }),
  chainIcon: css.raw({
    display: 'inline',
    verticalAlign: 'text-bottom',
  }),
};
