import { css } from '@repo/styles/css';

export const styles = {
  successContent: css.raw({
    backgroundColor: 'stepperSuccessBackground',
  }),
  bridgingContent: css.raw({
    backgroundColor: 'stepperBridgingBackground',
  }),
  errorContent: css.raw({
    backgroundColor: 'stepperErrorBackground',
  }),
  recoveryContent: css.raw({
    backgroundColor: 'stepperRecoveryBackground',
  }),
  recoveryActionMessage: css.raw({
    marginTop: '12px',
  }),
  content: css.raw({
    marginTop: '12px',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    maxWidth: '100%',
    flexDirection: 'column',
    gap: '16px',
  }),
  message: css.raw({
    '& span': {
      fontWeight: 'medium',
    },
  }),
  errorMessage: css.raw({
    '--colors-scrollbar-thumb': 'colors.stepperErrorBackground',
    width: '100%',
    maxHeight: 'min(calc(80vw), 300px)',
    overflowX: 'hidden',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    backgroundColor: 'stepperErrorBackground',
    padding: '4px',
    borderRadius: '8px',
    lineHeight: '1.1',
  }),
  messageHighlight: css.raw({
    fontWeight: 'medium',
  }),
  friendlyMessage: css.raw({
    textStyle: 'body.medium',
  }),
  rememberContainer: css.raw({
    marginTop: '16px',
  }),
  dustContainer: css.raw({
    marginTop: '16px',
  }),
  icon: css.raw({
    height: '20px',
    marginRight: '8px',
  }),
  buttons: css.raw({
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
  }),
  link: css.raw({
    textDecoration: 'none',
    color: 'green.80-40',
  }),
};
