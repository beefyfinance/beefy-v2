import { memo, type ReactNode, type CSSProperties } from 'react';
import { css, type CssStyles, cva } from '@repo/styles/css';
import { defaultSize } from './config.ts';

const calcImgSize = (value: number, baseSize: number) =>
  `${((value / baseSize) * 100).toFixed(4)}%`;

const getArrangementStyles = (count: number, size: number): CSSProperties => {
  switch (count) {
    case 1:
      return {
        '--img-position': 'static',
        '--img-width': '100%',
        '--img-height': '100%',
      } as CSSProperties;

    case 2:
      return {
        '--img-width': calcImgSize(32, 48),
        '--img-height': calcImgSize(32, 48),
        '--img-1-left': '0',
        '--img-1-z-index': '2',
        '--img-2-right': '0',
        '--img-2-z-index': '1',
      } as CSSProperties;

    case 3:
      return {
        '--img-width': calcImgSize(28, 48),
        '--img-height': calcImgSize(28, 48),
        '--img-1-top': calcImgSize(2, size),
        '--img-1-left': '0',
        '--img-1-z-index': '3',
        '--img-2-top': calcImgSize(2, size),
        '--img-2-right': '0',
        '--img-2-z-index': '1',
        '--img-3-bottom': calcImgSize(2, size),
        '--img-3-left': '0',
        '--img-3-right': '0',
        '--img-3-margin-left': 'auto',
        '--img-3-margin-right': 'auto',
        '--img-3-z-index': '2',
      } as CSSProperties;

    case 4:
      return {
        '--img-width': calcImgSize(26, 48),
        '--img-height': calcImgSize(26, 48),
        '--img-1-top': '0',
        '--img-1-left': '0',
        '--img-1-z-index': '4',
        '--img-2-top': '0',
        '--img-2-right': '0',
        '--img-2-z-index': '3',
        '--img-3-bottom': '0',
        '--img-3-left': '0',
        '--img-3-z-index': '2',
        '--img-4-bottom': '0',
        '--img-4-right': '0',
        '--img-4-z-index': '1',
      } as CSSProperties;

    case 5:
      return {
        '--img-width': calcImgSize(24, 48),
        '--img-height': calcImgSize(24, 48),
        '--img-1-top': '0',
        '--img-1-left': '0',
        '--img-2-top': '0',
        '--img-2-right': '0',
        '--img-3-bottom': '0',
        '--img-3-left': '0',
        '--img-4-bottom': '0',
        '--img-4-right': '0',
        '--img-5-top': '50%',
        '--img-5-left': '50%',
        '--img-5-transform': 'translate(-50%, -50%)',
      } as CSSProperties;

    case 6:
      return {
        '--img-width': calcImgSize(24, 48),
        '--img-height': calcImgSize(24, 48),
        '--img-1-top': '0',
        '--img-1-left': '0',
        '--img-1-z-index': '6',
        '--img-2-top': '0',
        '--img-2-left': calcImgSize(12, size),
        '--img-2-z-index': '5',
        '--img-3-top': '0',
        '--img-3-left': calcImgSize(24, size),
        '--img-3-z-index': '4',
        '--img-4-bottom': '0',
        '--img-4-left': '0',
        '--img-4-z-index': '3',
        '--img-5-bottom': '0',
        '--img-5-left': calcImgSize(12, size),
        '--img-5-z-index': '2',
        '--img-6-bottom': '0',
        '--img-6-left': calcImgSize(24, size),
        '--img-6-z-index': '1',
      } as CSSProperties;

    case 7:
      return {
        '--img-width': calcImgSize(24, 48),
        '--img-height': calcImgSize(24, 48),
        '--img-1-top': calcImgSize(4, size),
        '--img-1-left': '0',
        '--img-1-z-index': '6',
        '--img-2-top': '0',
        '--img-2-left': calcImgSize(12, size),
        '--img-2-z-index': '5',
        '--img-3-top': calcImgSize(4, size),
        '--img-3-right': '0',
        '--img-3-z-index': '4',
        '--img-4-bottom': calcImgSize(4, size),
        '--img-4-right': '0',
        '--img-4-z-index': '3',
        '--img-5-bottom': '0',
        '--img-5-left': calcImgSize(12, size),
        '--img-5-z-index': '1',
        '--img-6-bottom': calcImgSize(4, size),
        '--img-6-left': '0',
        '--img-6-z-index': '2',
        '--img-7-top': '50%',
        '--img-7-left': '50%',
        '--img-7-transform': 'translate(-50%, -50%)',
        '--img-7-z-index': '7',
      } as CSSProperties;

    case 8:
      return {
        '--img-width': calcImgSize(19, 48),
        '--img-height': calcImgSize(19, 48),
        '--img-1-top': calcImgSize(8, size),
        '--img-1-left': '0',
        '--img-1-z-index': '8',
        '--img-2-top': calcImgSize(8, size),
        '--img-2-left': calcImgSize(10, size),
        '--img-2-z-index': '7',
        '--img-3-top': calcImgSize(8, size),
        '--img-3-left': calcImgSize(19, size),
        '--img-3-z-index': '6',
        '--img-4-top': calcImgSize(8, size),
        '--img-4-left': calcImgSize(29, size),
        '--img-4-z-index': '5',
        '--img-5-bottom': calcImgSize(9, size),
        '--img-5-left': '0',
        '--img-5-z-index': '4',
        '--img-6-bottom': calcImgSize(9, size),
        '--img-6-left': calcImgSize(10, size),
        '--img-6-z-index': '3',
        '--img-7-bottom': calcImgSize(9, size),
        '--img-7-left': calcImgSize(19, size),
        '--img-7-z-index': '2',
        '--img-8-bottom': calcImgSize(9, size),
        '--img-8-left': calcImgSize(29, size),
        '--img-8-z-index': '1',
      } as CSSProperties;

    default:
      return {};
  }
};

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
    width: 'var(--size)',
    height: 'var(--size)',
    '& img': {
      position: 'absolute',
      width: 'var(--img-width)',
      height: 'var(--img-height)',
      '&:nth-child(1)': {
        position: 'var(--img-position, absolute)',
        top: 'var(--img-1-top, auto)',
        bottom: 'var(--img-1-bottom, auto)',
        left: 'var(--img-1-left, auto)',
        right: 'var(--img-1-right, auto)',
        marginLeft: 'var(--img-1-margin-left, 0)',
        marginRight: 'var(--img-1-margin-right, 0)',
        transform: 'var(--img-1-transform, none)',
        zIndex: 'var(--img-1-z-index, auto)',
      },
      '&:nth-child(2)': {
        top: 'var(--img-2-top, auto)',
        bottom: 'var(--img-2-bottom, auto)',
        left: 'var(--img-2-left, auto)',
        right: 'var(--img-2-right, auto)',
        marginLeft: 'var(--img-2-margin-left, 0)',
        marginRight: 'var(--img-2-margin-right, 0)',
        transform: 'var(--img-2-transform, none)',
        zIndex: 'var(--img-2-z-index, auto)',
      },
      '&:nth-child(3)': {
        top: 'var(--img-3-top, auto)',
        bottom: 'var(--img-3-bottom, auto)',
        left: 'var(--img-3-left, auto)',
        right: 'var(--img-3-right, auto)',
        marginLeft: 'var(--img-3-margin-left, 0)',
        marginRight: 'var(--img-3-margin-right, 0)',
        transform: 'var(--img-3-transform, none)',
        zIndex: 'var(--img-3-z-index, auto)',
      },
      '&:nth-child(4)': {
        top: 'var(--img-4-top, auto)',
        bottom: 'var(--img-4-bottom, auto)',
        left: 'var(--img-4-left, auto)',
        right: 'var(--img-4-right, auto)',
        marginLeft: 'var(--img-4-margin-left, 0)',
        marginRight: 'var(--img-4-margin-right, 0)',
        transform: 'var(--img-4-transform, none)',
        zIndex: 'var(--img-4-z-index, auto)',
      },
      '&:nth-child(5)': {
        top: 'var(--img-5-top, auto)',
        bottom: 'var(--img-5-bottom, auto)',
        left: 'var(--img-5-left, auto)',
        right: 'var(--img-5-right, auto)',
        marginLeft: 'var(--img-5-margin-left, 0)',
        marginRight: 'var(--img-5-margin-right, 0)',
        transform: 'var(--img-5-transform, none)',
        zIndex: 'var(--img-5-z-index, auto)',
      },
      '&:nth-child(6)': {
        top: 'var(--img-6-top, auto)',
        bottom: 'var(--img-6-bottom, auto)',
        left: 'var(--img-6-left, auto)',
        right: 'var(--img-6-right, auto)',
        marginLeft: 'var(--img-6-margin-left, 0)',
        marginRight: 'var(--img-6-margin-right, 0)',
        transform: 'var(--img-6-transform, none)',
        zIndex: 'var(--img-6-z-index, auto)',
      },
      '&:nth-child(7)': {
        top: 'var(--img-7-top, auto)',
        bottom: 'var(--img-7-bottom, auto)',
        left: 'var(--img-7-left, auto)',
        right: 'var(--img-7-right, auto)',
        marginLeft: 'var(--img-7-margin-left, 0)',
        marginRight: 'var(--img-7-margin-right, 0)',
        transform: 'var(--img-7-transform, none)',
        zIndex: 'var(--img-7-z-index, auto)',
      },
      '&:nth-child(8)': {
        top: 'var(--img-8-top, auto)',
        bottom: 'var(--img-8-bottom, auto)',
        left: 'var(--img-8-left, auto)',
        right: 'var(--img-8-right, auto)',
        marginLeft: 'var(--img-8-margin-left, 0)',
        marginRight: 'var(--img-8-margin-right, 0)',
        transform: 'var(--img-8-transform, none)',
        zIndex: 'var(--img-8-z-index, auto)',
      },
    },
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
  size = defaultSize,
  css: cssProp,
}) {
  if (!isValidCount(count)) {
    throw new Error('Invalid count');
  }

  const arrangementStyles = getArrangementStyles(count, size);
  const sizeStyles = { width: size, height: size, '--size': size } as CSSProperties;

  return (
    <div
      className={css(recipe.raw(), cssProp)}
      style={{ ...arrangementStyles, ...sizeStyles }}
      children={children}
    />
  );
});
