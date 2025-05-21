import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';

export type ButtonVariantProps = StyledVariantProps<typeof Button>;

export const Button = styled('button', {
  base: {
    textStyle: 'inherit',
    backgroundColor: 'transparent',
    borderRadius: '0px',
    paddingBlock: '6px',
    paddingInline: '10px',
    flexGrow: 1,
    flexShrink: 0,
    position: 'relative',
    _hover: {
      color: 'colorPalette.hover.color',
    },
    _first: {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
    _last: {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
  },
  variants: {
    noBackground: {
      false: {
        paddingInline: '10px',
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
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          borderColor: 'colorPalette.active.background',
          borderStyle: 'solid',
          borderWidth: '3px', // =Buttons borderWidth
          borderRadius: 'inherit',
          top: '-2px', // -Buttons borderWidth
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          zIndex: '[1]',
        },
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
