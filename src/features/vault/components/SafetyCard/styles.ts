import { css } from '@repo/styles/css';

export const styles = {
  riskList: css.raw({
    marginBottom: '32px',
  }),
  warning: css.raw({
    marginBottom: '18px',
  }),
  riskRow: css.raw({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '16px',
    '&:last-child': {
      marginBottom: '0',
    },
  }),
  risk: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    marginRight: '8',
  }),
  riskCategory: css.raw({
    color: 'text.dark',
  }),
  infoContainer: css.raw({
    display: 'flex',
    alignItems: 'flex-start',
  }),
  moreInfoContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  notes: css.raw({
    '& p': {
      margin: '0 0 12px 0',
      color: 'text.middle',
    },
    '& p:last-child': {
      marginBottom: '0',
    },
  }),
  arrow: css.raw({
    marginTop: '5px',
    marginRight: '8px',
  }),
  tooltipLabel: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  tooltipIcon: css.raw({
    color: 'text.dark',
  }),
  safetyLabel: css.raw({
    textStyle: 'h2',
    color: 'text.light',
    marginRight: '16px',
  }),
  tooltipHolder: css.raw({
    marginLeft: '4px',
  }),
  howItWorksContainer: css.raw({
    padding: '16',
    backgroundColor: 'background.content.light',
  }),
  titleClassName: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  up: css.raw({
    fill: 'green',
  }),
  down: css.raw({
    fill: 'indicators.error',
  }),
};
