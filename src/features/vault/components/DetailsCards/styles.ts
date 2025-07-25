import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

export const Container = styled('div', {
  base: {
    background: 'background.content.light',
    padding: '16px',
    borderRadius: '12px',
  },
});

export const TitleContainer = styled('div', {
  base: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '16px',
    flexWrap: 'wrap',
  },
});

export const AssetIconSymbol = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    flexGrow: '1',
    sm: {
      order: '1',
      flexGrow: '0',
    },
  },
});

export const AssetSymbol = styled('div', {
  base: {
    textStyle: 'body.medium',
    flexGrow: '1',
  },
});

export const Links = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    sm: {
      order: '3',
    },
  },
});

export const AssetsBridgePrice = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    sm: {
      flexGrow: '1',
      order: '2',
    },
  },
});

export const Description = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.middle',
    marginTop: '16px',
    whiteSpace: 'pre-line',
  },
});

export const Image = styled('img', {
  base: {
    width: '24px',
    height: '24px',
  },
});

export const styles = {
  assetLinkText: css.raw({
    display: 'none',
    lg: {
      display: 'inline',
    },
  }),
  descriptionPending: css.raw({
    fontStyle: 'italic',
  }),
};
