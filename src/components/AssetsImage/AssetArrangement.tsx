import { memo, type ReactNode } from 'react';
import { css, type CssStyles, cva } from '@repo/styles/css';
import { defaultSize } from './config.ts';

const recipe = cva({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
    transform: 'translate(0, 0)', // new zIndex context
    width: 'defaultAssetsImageSize',
    height: 'defaultAssetsImageSize',
    '& img': {
      position: 'absolute',
    },
  },
  variants: {
    count: {
      1: {
        '& img': {
          position: 'static',
          width: '100%',
          height: '100%',
        },
      },
      2: {
        '& img': {
          width: `${((32 / 48) * 100).toFixed(4)}%`,
          height: `${((32 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            left: 0,
            zIndex: 2,
          },
          '&:nth-child(2)': {
            right: 0,
            zIndex: 1,
          },
        },
      },
      3: {
        '& img': {
          width: `${((28 / 48) * 100).toFixed(4)}%`,
          height: `${((28 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: `${((2 / 48) * 100).toFixed(4)}%`,
            left: 0,
            zIndex: 3,
          },
          '&:nth-child(2)': {
            top: `${((2 / 48) * 100).toFixed(4)}%`,
            right: 0,
            zIndex: 1,
          },
          '&:nth-child(3)': {
            bottom: `${((2 / 48) * 100).toFixed(4)}%`,
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            zIndex: 2,
          },
        },
      },
      4: {
        '& img': {
          width: `${((26 / 48) * 100).toFixed(4)}%`,
          height: `${((26 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: 0,
            left: 0,
            zIndex: 4,
          },
          '&:nth-child(2)': {
            top: 0,
            right: 0,
            zIndex: 3,
          },
          '&:nth-child(3)': {
            bottom: 0,
            left: 0,
            zIndex: 2,
          },
          '&:nth-child(4)': {
            bottom: 0,
            right: 0,
            zIndex: 1,
          },
        },
      },
      5: {
        '& img': {
          width: `${((24 / 48) * 100).toFixed(4)}%`,
          height: `${((24 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: 0,
            left: 0,
          },
          '&:nth-child(2)': {
            top: 0,
            right: 0,
          },
          '&:nth-child(3)': {
            bottom: 0,
            left: 0,
          },
          '&:nth-child(4)': {
            bottom: 0,
            right: 0,
          },
          '&:nth-child(5)': {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        },
      },
      6: {
        '& img': {
          width: `${((24 / 48) * 100).toFixed(4)}%`,
          height: `${((24 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: 0,
            left: 0,
            zIndex: 6,
          },
          '&:nth-child(2)': {
            top: 0,
            left: `${((12 / 48) * 100).toFixed(4)}%`,
            zIndex: 5,
          },
          '&:nth-child(3)': {
            top: 0,
            left: `${((24 / 48) * 100).toFixed(4)}%`,
            zIndex: 4,
          },
          '&:nth-child(4)': {
            bottom: 0,
            left: 0,
            zIndex: 3,
          },
          '&:nth-child(5)': {
            bottom: 0,
            left: `${((12 / 48) * 100).toFixed(4)}%`,
            zIndex: 2,
          },
          '&:nth-child(6)': {
            bottom: 0,
            left: `${((24 / 48) * 100).toFixed(4)}%`,
            zIndex: 1,
          },
        },
      },
      7: {
        '& img': {
          width: `${((24 / 48) * 100).toFixed(4)}%`,
          height: `${((24 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: `${((4 / 48) * 100).toFixed(4)}%`,
            left: 0,
            zIndex: 6,
          },
          '&:nth-child(2)': {
            top: 0,
            left: `${((12 / 48) * 100).toFixed(4)}%`,
            zIndex: 5,
          },
          '&:nth-child(3)': {
            top: `${((4 / 48) * 100).toFixed(4)}%`,
            right: 0,
            zIndex: 4,
          },
          '&:nth-child(4)': {
            bottom: `${((4 / 48) * 100).toFixed(4)}%`,
            right: 0,
            zIndex: 3,
          },
          '&:nth-child(5)': {
            bottom: 0,
            left: `${((12 / 48) * 100).toFixed(4)}%`,
            zIndex: 1,
          },
          '&:nth-child(6)': {
            bottom: `${((4 / 48) * 100).toFixed(4)}%`,
            left: 0,
            zIndex: 2,
          },
          '&:nth-child(7)': {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 7,
          },
        },
      },
      8: {
        '& img': {
          width: `${((19 / 48) * 100).toFixed(4)}%`,
          height: `${((19 / 48) * 100).toFixed(4)}%`,
          '&:nth-child(1)': {
            top: `${((8 / 48) * 100).toFixed(4)}%`,
            left: 0,
            zIndex: 8,
          },
          '&:nth-child(2)': {
            top: `${((8 / 48) * 100).toFixed(4)}%`,
            left: `${((10 / 48) * 100).toFixed(4)}%`,
            zIndex: 7,
          },
          '&:nth-child(3)': {
            top: `${((8 / 48) * 100).toFixed(4)}%`,
            left: `${((19 / 48) * 100).toFixed(4)}%`,
            zIndex: 6,
          },
          '&:nth-child(4)': {
            top: `${((8 / 48) * 100).toFixed(4)}%`,
            left: `${((29 / 48) * 100).toFixed(4)}%`,
            zIndex: 5,
          },
          '&:nth-child(5)': {
            bottom: `${((9 / 48) * 100).toFixed(4)}%`,
            left: 0,
            zIndex: 4,
          },
          '&:nth-child(6)': {
            bottom: `${((9 / 48) * 100).toFixed(4)}%`,
            left: `${((10 / 48) * 100).toFixed(4)}%`,
            zIndex: 3,
          },
          '&:nth-child(7)': {
            bottom: `${((9 / 48) * 100).toFixed(4)}%`,
            left: `${((19 / 48) * 100).toFixed(4)}%`,
            zIndex: 2,
          },
          '&:nth-child(8)': {
            bottom: `${((9 / 48) * 100).toFixed(4)}%`,
            left: `${((29 / 48) * 100).toFixed(4)}%`,
            zIndex: 1,
          },
        },
      },
    },
  },
  defaultVariants: {
    count: 1,
  },
});

type AssetArrangementProps = {
  count: number;
  children: ReactNode;
  size?: number;
  css?: CssStyles;
};

function isValidCount(count: number): count is 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  return count >= 1 && count <= 8;
}

export const AssetArrangement = memo<AssetArrangementProps>(function AssetArrangement({
  count,
  children,
  size = 48,
  css: cssProp,
}) {
  if (!isValidCount(count)) {
    throw new Error('Invalid count');
  }

  return (
    <div
      className={css(recipe.raw({ count }), cssProp)}
      style={size !== defaultSize ? { width: size, height: size } : undefined}
      children={children}
    />
  );
});
