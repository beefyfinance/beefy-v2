import { styled } from '@repo/styles/jsx';

export const Content = styled('div', {
  base: {
    marginTop: '12px',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    maxWidth: '100%',
    flexDirection: 'column',
    gap: '16px',
  },
  variants: {
    variant: {
      success: { backgroundColor: 'stepperSuccessBackground' },
      bridging: { backgroundColor: 'stepperBridgingBackground' },
      error: { backgroundColor: 'stepperErrorBackground' },
      recovery: { backgroundColor: 'stepperRecoveryBackground' },
    },
  },
});

export const Message = styled('div', {
  base: {
    '& span': {
      fontWeight: 'medium',
    },
  },
  variants: {
    variant: {
      recoveryAction: {
        marginTop: '12px',
      },
    },
  },
});

export const MessageHighlight = styled('div', {
  base: {
    fontWeight: 'medium',
  },
});

export const Buttons = styled('div', {
  base: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    width: '100%',
    alignItems: 'stretch',
    gap: '10px',
    marginTop: '12px',
    '& > *': {
      height: '44px',
    },
  },
  variants: {
    layout: {
      retryClose: {
        gridAutoColumns: 'unset',
        gridTemplateColumns: '1fr auto',
      },
    },
  },
});
