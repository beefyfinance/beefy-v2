import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';

export type ButtonVariantProps = StyledVariantProps<typeof Button>;

export const Button = styled('button', {
  base: {
    textStyle: 'inherit',
    backgroundColor: 'transparent',
    borderRadius: '0px',
    paddingBlock: '6px',
    paddingInline: '12px',
    flexGrow: 1,
    flexShrink: 0,
    position: 'relative',
    _hover: {
      color: 'colorPalette.hover.color',
    },
    '&:first-child': {
      borderTopLeftRadius: '4px',
      borderBottomLeftRadius: '4px',
    },

    '&:last-child': {
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px',
    },
  },
  variants: {
    noBackground: {
      false: {
        paddingInline: '12px',
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
    {
      active: false,
      noBackground: false,
      css: {
        _hover: {
          backgroundColor: 'colorPalette.hover.background',
        },
      },
    },
  ],
  defaultVariants: {
    active: false,
    noBackground: false,
    unselectable: false,
  },
});
