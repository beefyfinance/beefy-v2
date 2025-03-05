import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    backgroundColor: 'background.content.light',
    padding: '16px',
    borderRadius: '12px',
  }),
  titleContainer: css.raw({
    display: 'flex',
    columnGap: '8px',
    rowGap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  }),
  assetIconSymbol: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    flexGrow: '1',
    sm: {
      order: '1',
      flexGrow: '0',
    },
  }),
  assetIcon: css.raw({
    height: '24px',
  }),
  assetSymbol: css.raw({
    textStyle: 'body.medium',
    flexGrow: '1',
  }),
  assetBridgePrice: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    sm: {
      flexGrow: '1',
      order: '2',
    },
  }),
  assetBridge: css.raw({}),
  assetPrice: css.raw({}),
  assetLinks: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    sm: {
      order: '3',
    },
  }),
  assetLinkText: css.raw({
    display: 'none',
    lg: {
      display: 'inline',
    },
  }),
  assetWebsite: css.raw({}),
  assetContract: css.raw({}),
  assetDocumentation: css.raw({}),
  description: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    marginTop: '16px',
    whiteSpace: 'pre-line',
  }),
  descriptionPending: css.raw({
    fontStyle: 'italic',
  }),
};
