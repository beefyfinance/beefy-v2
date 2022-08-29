import { Theme } from '@material-ui/core';

const borderColor = '#363B63';
const border = `solid 2px ${borderColor}`;
const nestedAssetIndent = '16px';

export const styles = (theme: Theme) => ({
  table: {
    display: 'grid',
    gridTemplateColumns: `${nestedAssetIndent} auto max-content max-content`,
    gridTemplateRows: 'none',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    [theme.breakpoints.up('lg')]: {
      borderBottomLeftRadius: 0,
    },
  },
  cell: {
    display: 'flex',
    padding: '16px 24px',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    alignItems: 'center',
  },
  row: {
    backgroundColor: '#2D3153',
    display: 'contents',
    '& $cell': {
      borderTop: border,
    },
    '& $cell:nth-child(2), & $cell:nth-child(3)': {
      textAlign: 'right' as const,
    },
    '& $icon': {
      display: 'inline-flex',
    },
  },
  data: {
    display: 'contents',
    '& >:first-child': {
      gridColumn: 'span 2',
    },
  },
  underlying: {
    display: 'contents',
    '& > $row': {
      paddingLeft: 0,
      '&:first-child': {
        borderTop: border,
      },
      '& $data > :first-child': {
        gridColumn: '2 / span 1',
      },
    },
  },
  header: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    '& $cell': {
      borderTop: 0,
    },
  },
  footer: {
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    [theme.breakpoints.up('lg')]: {
      borderBottomLeftRadius: 0,
    },
    '& $cell': {
      backgroundColor: '#363B63',
    },
  },
  asset: {
    width: 0,
    flex: 'auto',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    alignItems: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: '32px',
    height: '32px',
    marginRight: '8px',
  },
  tokenAmount: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: 'min-content',
    maxWidth: '100%',
    marginLeft: 'auto',
  },
  infoAnchor: {
    color: '#8585A6',
  },
});
