import { css } from '@repo/styles/css';

export const styles = {
  assetsContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    marginTop: '1px',
    rowGap: '1px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  }),
  assetTypes: css.raw({
    backgroundColor: 'background.content.dark',
    padding: '8px 16px',
    textStyle: 'subline.sm',
    color: 'text.dark',
    fontWeight: 'bold',
  }),
};
