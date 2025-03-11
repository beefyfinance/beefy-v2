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
      color: 'tenderlyStackToText',
    },
    stackFunc: {
      color: 'tenderlyStackFuncText',
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
      color: 'tenderlyStackPairName',
    },
    stackTag: {
      textStyle: 'subline.sm',
      flex: '0 0 auto',
      padding: '1px 4px',
      display: 'block',
      backgroundColor: 'tenderlyStackTagBackground',
      border: '1px solid tenderlyStackTagBackground',
      color: 'tenderlyStackTagText',
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
        color: 'tenderlyStackSourceStrongText',
      },
    },
  },
  variants: {
    type: {
      revert: {
        stackTag: {
          backgroundColor: 'tenderlyRevertStackTagBackground',
          border: '1px solid tenderlyRevertStackTagBackground',
          color: 'tenderlyStackSourceStrongText',
          '&:hover': {
            borderColor: 'tenderlyRevertStackTagBorder',
          },
        },
      },
      call: {
        stackTag: {
          backgroundColor: 'tenderlyCallStackTagBackground',
          border: '1px solid tenderlyCallStackTagBackground',
          color: 'tenderlyCallStackTagText',
          '&:hover': {
            borderColor: 'tenderlyCallStackTagText',
          },
        },
      },
      delegatecall: {
        stackTag: {
          backgroundColor: 'tenderlyCallStackTagBackground',
          border: '1px solid tenderlyCallStackTagBackground',
          color: 'tenderlyCallStackTagText',
          '&:hover': {
            borderColor: 'tenderlyCallStackTagText',
          },
        },
      },
      jumpdest: {
        stackTag: {
          backgroundColor: 'tenderlyJumpDestStackTagBackground',
          border: '1px solid tenderlyJumpDestStackTagBackground',
          color: 'tenderlyJumpDestStackTagText',
          '&:hover': {
            borderColor: 'tenderlyJumpDestStackTagBorder',
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
    color: 'tenderlyStackPairName',
  }),
  pairDisplayOdd: css.raw({
    background: 'background.content.dark',
    '& > .pairDisplayKey': {
      color: 'tenderlyPairDisplayAltText',
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
