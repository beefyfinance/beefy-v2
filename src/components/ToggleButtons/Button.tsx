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
    variant: {
      default: {},
      card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: '0',
        paddingTop: '8px',
        paddingBottom: '10px',
        paddingLeft: '11px',
        paddingRight: '10px',
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        textAlign: 'left',
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: 'colorPalette.background',
        color: 'colorPalette.color',
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      noBackground: false,
      variant: 'default',
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
      variant: 'default',
      css: {
        _hover: {
          backgroundColor: 'colorPalette.hover.background',
        },
      },
    },
    {
      active: true,
      variant: 'card',
      css: {
        backgroundColor: 'colorPalette.active.background',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          borderColor: 'colorPalette.active.background',
          borderStyle: 'solid',
          borderWidth: '2px',
          borderRadius: 'inherit',
          top: '-1px',
          left: '-1px',
          right: '-1px',
          bottom: '-1px',
          zIndex: '[1]',
        },
      },
    },
  ],
  defaultVariants: {
    active: false,
    noBackground: false,
    unselectable: false,
    variant: 'default',
  },
});
