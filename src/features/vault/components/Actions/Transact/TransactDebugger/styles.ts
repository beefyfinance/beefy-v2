import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'none',
    position: 'fixed',
    top: '0',
    left: '0',
    width: 'calc((100vw - 1296px)/2)',
    height: '100%',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    backgroundColor: 'transactDebuggerBackground',
    '@media (min-width: 2000px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
  }),
  item: css.raw({
    '&:nth-child(2n)': {
      background: 'transactDebuggerItemAltBackground',
    },
  }),
  grid: css.raw({
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto',
    gridTemplateRows: 'auto',
    whiteSpace: 'nowrap',
    width: '100%',
    maxWidth: '100%',
    textAlign: 'left',
    gap: '2px 8px',
  }),
  address: css.raw({
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  }),
};
