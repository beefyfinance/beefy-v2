import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    marginBottom: '4px',
  },
  transaction: {
    minHeight: 0,
  },
  transactionHeader: {
    display: 'flex',
    gap: '4px 8px',
  },
  transactionHeaderIndex: {},
  transactionHeaderStep: {},
  transactionHeaderStatus: {
    marginLeft: 'auto',
  },
  transactionDetails: {
    marginTop: '8px',
  },
  transactionSuccess: {
    '& $transactionHeaderStatus': {
      color: theme.palette.background.indicators.success,
    },
  },
  transactionRevert: {
    '& $transactionHeaderStatus': {
      color: theme.palette.background.indicators.error,
    },
  },
  transactionMissing: {
    '& $transactionHeaderStatus': {
      color: theme.palette.text.dark,
    },
  },
  reverts: {
    display: 'flex',
    gap: '16px',
    flexDirection: 'column' as const,
  },
  revert: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column' as const,
  },
  revertReason: {},
  revertStack: {
    display: 'flex',
    gap: '4px',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.contentDark,
    padding: '8px',
  },
  stack: {
    display: 'flex',
    gap: '4px 8px',
    width: '100%',
  },
  stackIndent: {},
  stackDetails: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  stackToFunc: {
    display: 'flex',
  },
  stackTo: {
    color: '#71aefe',
  },
  stackFunc: {
    color: '#9e8cfc',
  },
  stackFuncAccessor: { color: theme.palette.text.middle },
  stackFuncParamsOpen: { color: theme.palette.text.middle },
  stackFuncParamsClose: { color: theme.palette.text.middle },
  stackFuncOutput: { color: theme.palette.text.middle },
  stackInput: {},
  stackOutput: {},
  stackPair: {
    display: 'flex',
    gap: '4px',
  },
  stackPairName: {
    color: '#edc389',
  },
  stackPairValue: {},
  stackPairMultiLine: {
    flexDirection: 'column' as const,
    '& $stackPairValue': {
      overflow: 'auto',
      whiteSpace: 'pre-wrap' as const,
      padding: '8px',
      maxWidth: '100%',
    },
  },
  stackTag: {
    ...theme.typography['subline-sm'],
    flex: '0 0 auto',
    padding: '1px 4px',
    display: 'block',
    backgroundColor: '#CEC0F01F',
    border: '1px solid #CEC0F01F',
    color: '#CEC0F0FF',
    width: 54,
    textAlign: 'center' as const,
    '&:hover': {
      textDecoration: 'none',
    },
  },
  stackSource: {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 1px ${theme.palette.background.searchInputBg}`,
    borderRadius: '4px',
    width: '100%',
    padding: '4px 8px',
    '& strong': {
      color: '#e5484d',
    },
  },
  stackRevert: {
    '& $stackTag': {
      backgroundColor: '#f020561f',
      border: '1px solid #f020561f',
      color: '#e5484d',
      '&:hover': {
        borderColor: '#f02056',
      },
    },
  },
  stackCall: {
    '& $stackTag': {
      backgroundColor: '#9873f01f',
      border: '1px solid #9873f01f',
      color: '#9873f0',
      '&:hover': {
        borderColor: '#9873f0',
      },
    },
  },
  stackCallDelegate: {
    '& $stackTag': {
      backgroundColor: '#9873f01f',
      border: '1px solid #9873f01f',
      color: '#9873f0',
      '&:hover': {
        borderColor: '#9873f0',
      },
    },
  },
  stackJumpDest: {
    '& $stackTag': {
      backgroundColor: '#23c1971f',
      border: '1px solid #23c1971f',
      color: '#30a46c',
      '&:hover': {
        borderColor: '#23c197',
      },
    },
  },
  stackUnknown: {},
  bytesDisplay: {
    fontFamily: 'monospace',
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 1px ${theme.palette.background.searchInputBg}`,
    borderRadius: '4px',
    width: '100%',
  },
  bytesDisplayInner: {
    padding: '4px 8px',
  },
  bytesDisplayLine: {
    display: 'flex',
    '&::before': {
      content: 'attr(data-line)',
      textAlign: 'right' as const,
      marginRight: '8px',
      userSelect: 'none' as const,
      color: theme.palette.text.dark,
    },
  },
  paramsDisplay: {
    fontFamily: 'monospace',
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 1px ${theme.palette.background.searchInputBg}`,
    borderRadius: '4px',
    width: '100%',
  },
  pairDisplay: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '2px 8px',
    background: theme.palette.background.contentPrimary,
    padding: '4px 8px',
  },
  pairDisplayKey: {
    color: '#edc389',
  },
  pairDisplayValue: {},
  pairDisplayOdd: {
    background: theme.palette.background.contentDark,
    '& > $pairDisplayKey': {
      color: '#ed9889',
    },
  },
  calls: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto minmax(0, 1fr)',
    gap: '4px 8px',
  },
  callHeader: {
    fontWeight: theme.typography['body-sm-med'].fontWeight,
  },
  callData: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
