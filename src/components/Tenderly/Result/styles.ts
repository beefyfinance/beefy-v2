import { css, sva } from '@repo/styles/css';

export const transactionRecipe = sva({
  slots: [
    'transaction',
    'transactionHeader',
    'transactionHeaderIndex',
    'transactionHeaderStep',
    'transactionHeaderStatus',
    'transactionDetails',
  ],
  base: {
    transaction: {
      minHeight: '0',
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
  },
  variants: {
    status: {
      success: {
        transactionHeaderStatus: {
          color: 'indicators.success',
        },
      },
      revert: {
        transactionHeaderStatus: {
          color: 'indicators.error',
        },
      },
      missing: {
        transactionHeaderStatus: {
          color: 'text.dark',
        },
      },
    },
  },
});

export const stackRecipe = sva({
  slots: [
    'stack',
    'stackIndent',
    'stackDetails',
    'stackToFunc',
    'stackTo',
    'stackFunc',
    'stackFuncAccessor',
    'stackFuncParamsOpen',
    'stackFuncParamsClose',
    'stackFuncOutput',
    'stackInput',
    'stackOutput',
    'stackPair',
    'stackPairName',
    'stackTag',
    'stackSource',
  ],
  base: {
    stack: {
      display: 'flex',
      gap: '4px 8px',
      width: '100%',
    },
    stackIndent: {},
    stackDetails: {
      flex: '1 1 auto',
      minWidth: '0',
    },
    stackToFunc: {
      display: 'flex',
    },
    stackTo: {
      color: 'extracted1885',
    },
    stackFunc: {
      color: 'extracted2568',
    },
    stackFuncAccessor: {
      color: 'text.middle',
    },
    stackFuncParamsOpen: {
      color: 'text.middle',
    },
    stackFuncParamsClose: {
      color: 'text.middle',
    },
    stackFuncOutput: {
      color: 'text.middle',
    },
    stackInput: {},
    stackOutput: {},
    stackPair: {
      display: 'flex',
      gap: '4px',
    },
    stackPairName: {
      color: 'extracted1355',
    },
    stackTag: {
      textStyle: 'subline.sm',
      flex: '0 0 auto',
      padding: '1px 4px',
      display: 'block',
      backgroundColor: 'extracted3759o11',
      border: '1px solid extracted3759o11',
      color: 'extracted3759',
      width: '54',
      textAlign: 'center',
      '&:hover': {
        textDecoration: 'none',
      },
    },
    stackSource: {
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      color: 'text.light',
      backgroundColor: 'background.content',
      border: 'solid 1px {colors.purpleDarkest}',
      borderRadius: '4px',
      width: '100%',
      padding: '4px 8px',
      '& strong': {
        color: 'extracted556',
      },
    },
  },
  variants: {
    type: {
      revert: {
        stackTag: {
          backgroundColor: 'extracted2805o11',
          border: '1px solid extracted2805o11',
          color: 'extracted556',
          '&:hover': {
            borderColor: 'extracted2805',
          },
        },
      },
      call: {
        stackTag: {
          backgroundColor: 'extracted1757o11',
          border: '1px solid extracted1757o11',
          color: 'extracted1757',
          '&:hover': {
            borderColor: 'extracted1757',
          },
        },
      },
      delegatecall: {
        stackTag: {
          backgroundColor: 'extracted1757o11',
          border: '1px solid extracted1757o11',
          color: 'extracted1757',
          '&:hover': {
            borderColor: 'extracted1757',
          },
        },
      },
      jumpdest: {
        stackTag: {
          backgroundColor: 'extracted282o11',
          border: '1px solid extracted282o11',
          color: 'extracted2833',
          '&:hover': {
            borderColor: 'extracted282',
          },
        },
      },
      other: {},
      unknown: {},
    },
  },
  defaultVariants: {
    type: 'unknown',
  },
});

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    marginBottom: '4px',
  }),
  reverts: css.raw({
    display: 'flex',
    gap: '16px',
    flexDirection: 'column',
  }),
  revert: css.raw({
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
  }),
  revertStack: css.raw({
    display: 'flex',
    gap: '4px',
    flexDirection: 'column',
    backgroundColor: 'background.content.dark',
    padding: '8px',
  }),
  bytesDisplay: css.raw({
    fontFamily: 'monospace',
    color: 'text.light',
    backgroundColor: 'background.content',
    border: 'solid 1px {colors.purpleDarkest}',
    borderRadius: '4px',
    width: '100%',
  }),
  bytesDisplayInner: css.raw({
    padding: '4px 8px',
  }),
  bytesDisplayLine: css.raw({
    display: 'flex',
    '&::before': {
      content: 'attr(data-line)',
      textAlign: 'right',
      marginRight: '8px',
      userSelect: 'none',
      color: 'text.dark',
    },
  }),
  paramsDisplay: css.raw({
    fontFamily: 'monospace',
    color: 'text.light',
    backgroundColor: 'background.content',
    border: 'solid 1px {colors.purpleDarkest}',
    borderRadius: '4px',
    width: '100%',
  }),
  pairDisplay: css.raw({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '2px 8px',
    background: 'background.content',
    padding: '4px 8px',
  }),
  pairDisplayKey: css.raw({
    color: 'extracted1355',
  }),
  pairDisplayOdd: css.raw({
    background: 'background.content.dark',
    '& > .pairDisplayKey': {
      color: 'extracted516',
    },
  }),
  calls: css.raw({
    display: 'grid',
    gridTemplateColumns: 'auto auto auto minmax(0, 1fr)',
    gap: '4px 8px',
  }),
  callHeader: css.raw({
    fontWeight: 'medium',
  }),
  callData: css.raw({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
};
