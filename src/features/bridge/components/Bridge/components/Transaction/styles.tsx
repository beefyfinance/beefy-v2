import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  steps: {
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  step: {
    padding: '24px',
    backgroundColor: '#2D3153',
    position: 'relative' as const,
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
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
      position: 'absolute' as const,
      bottom: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '20px 40px 0 40px',
      borderColor: '#2D3153 transparent transparent transparent',
      zIndex: 1,
    },
  },
  stepFrom: {},
  stepBridge: {
    paddingTop: '32px',
    backgroundColor: '#313759',
    '&::after': {
      borderColor: '#313759 transparent transparent transparent',
    },
  },
  stepTo: {
    paddingTop: '32px',
    '&::after': {
      display: 'none',
      content: 'none',
    },
  },
  tokenAmount: {},
  via: {
    color: theme.palette.text.dark,
  },
  network: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  networkIcon: {
    display: 'block',
  },
  networkName: {},
  provider: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  providerDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fee: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  feeIcon: {
    width: '16px',
    height: '16px',
    fill: theme.palette.text.light,
  },
  time: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  timeIcon: {
    width: '16px',
    height: '16px',
    fill: theme.palette.text.light,
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
});
