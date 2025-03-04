import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';

export type ButtonVariantProps = StyledVariantProps<typeof Button>;

export const Button = styled('button', {
  base: {
    textStyle: 'inherit',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    paddingBlock: '6px',
    paddingInline: '8px',
    flexGrow: 1,
    flexShrink: 0,
    position: 'relative',
    _hover: {
      color: 'colorPalette.hover.color',
    },
  },
  variants: {
    noBackground: {
      false: {
        paddingInline: '16px',
        _hover: {
          backgroundColor: 'colorPalette.hover.background',
        },
      },
      true: {},
    },
    noPadding: {
      false: {},
      true: {
        paddingBlock: 0,
        paddingInline: 0,
      },
    },
    active: {
      true: {
        color: 'colorPalette.active.color',
      },
    },
    unselectable: {
      true: {
        pointerEvents: 'none',
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      noBackground: false,
      css: {
        backgroundColor: 'colorPalette.active.background',
      },
    },
  ],
  defaultVariants: {
    active: false,
    noBackground: false,
    unselectable: false,
  },
});
