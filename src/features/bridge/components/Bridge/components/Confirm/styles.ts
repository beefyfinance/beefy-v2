import { css } from '@repo/styles/css';

export const styles = {
  steps: css.raw({
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
  }),
  step: css.raw({
    padding: '24px',
    backgroundColor: 'background.content.light',
    position: 'relative',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:first-child': {
      borderRadius: '8px 8px 0 0',
    },
    '&:last-child': {
      borderRadius: '0 0 8px 8px',
    },
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      bottom: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0',
      height: '0',
      borderStyle: 'solid',
      borderWidth: '20px 40px 0 40px',
      borderColor: '[{colors.background.content.light} transparent transparent transparent]',
      zIndex: '[1]',
    },
  }),
  stepBridge: css.raw({
    paddingTop: '32px',
    backgroundColor: 'bayOfMany',
    '&::after': {
      borderColor: '[{colors.bayOfMany} transparent transparent transparent]',
    },
  }),
  stepTo: css.raw({
    paddingTop: '32px',
    '&::after': {
      display: 'none',
      content: 'none',
    },
  }),
  via: css.raw({
    color: 'text.dark',
  }),
  network: css.raw({
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  }),
  networkIcon: css.raw({
    display: 'block',
  }),
  provider: css.raw({
    marginTop: '8px',
    marginBottom: '8px',
  }),
  providerLogo: css.raw({
    height: '24px',
  }),
  providerDetails: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  fee: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  feeIcon: css.raw({
    width: '16px',
    height: '16px',
    fill: 'text.light',
  }),
  time: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  timeIcon: css.raw({
    width: '16px',
    height: '16px',
    fill: 'text.light',
  }),
  receiver: css.raw({
    textStyle: 'subline.sm',
    textTransform: 'none',
    wordBreak: 'break-all',
  }),
  buttonsContainer: css.raw({
    marginTop: 'auto',
  }),
};
