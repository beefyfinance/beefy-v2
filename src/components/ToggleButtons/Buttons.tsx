import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';

export type ButtonsVariantProps = StyledVariantProps<typeof Buttons>;

export const Buttons = styled('div', {
  base: {
    textStyle: 'body.medium',
    colorPalette: 'buttons.default',
    color: 'colorPalette.color',
    backgroundColor: 'colorPalette.background',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: 'colorPalette.border',
    borderRadius: '8px',
    display: 'flex',
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        width: '100%',
      },
    },
    variant: {
      default: {
        colorPalette: 'buttons.default',
      },
      filter: {
        colorPalette: 'buttons.filter',
      },
      success: {
        colorPalette: 'buttons.success',
      },
      boost: {
        colorPalette: 'buttons.boost',
      },
      range: {
        colorPalette: 'buttons.range',
        textStyle: 'body.sm.medium',
        gap: '12px',
      },
    },
    noBackground: {
      false: {},
      true: {
        paddingInline: '8px',
      },
    },
    noBorder: {
      false: {},
      true: {
        borderWidth: '0px',
      },
    },
  },
  compoundVariants: [
    {
      noBackground: true,
      variant: 'range',
      css: {
        paddingInline: '0',
      },
    },
  ],
  defaultVariants: {
    fullWidth: false,
    variant: 'default',
    noBackground: false,
  },
});
