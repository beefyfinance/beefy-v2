import { css } from '@repo/styles/css';

export const styles = {
  assetsContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    marginTop: '2px',
    rowGap: '2px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  }),
  filter: css.raw({
    display: 'grid',
    padding: '16px 24px',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    backgroundColor: 'background.content.dark',
    '& div': {
      textStyle: 'subline.sm',
      color: 'text.dark',
      fontWeight: 'bold',
    },
    lgDown: {
      padding: '16px',
    },
  }),
  assetTypes: css.raw({
    backgroundColor: 'background.content.dark',
    padding: '8px 16px',
    textStyle: 'subline.sm',
    color: 'text.dark',
    fontWeight: 'bold',
  }),
  sortColumn: css.raw({
    justifyContent: 'flex-start',
  }),
};
