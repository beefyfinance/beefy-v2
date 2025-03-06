import { cva, type RecipeVariantProps } from '@repo/styles/css';

export type ButtonVariantProps = NonNullable<RecipeVariantProps<typeof buttonRecipe>>;

export const buttonRecipe = cva({
  base: {
    colorPalette: 'buttons.default',
    color: 'colorPalette.color',
    backgroundColor: 'colorPalette.background',
    borderColor: 'colorPalette.border',
    borderRadius: '8px',
    _hover: {
      color: 'colorPalette.hover.color',
      backgroundColor: 'colorPalette.hover.background',
      borderColor: 'colorPalette.hover.border',
    },
    _active: {
      color: 'colorPalette.active.color',
      backgroundColor: 'colorPalette.active.background',
      borderColor: 'colorPalette.active.border',
    },
    _disabled: {
      color: 'colorPalette.disabled.color',
      backgroundColor: 'colorPalette.disabled.background',
      borderColor: 'colorPalette.disabled.border',
      opacity: '0.4',
    },
  },
  variants: {
    size: {
      sm: {
        padding: '6px 14px',
      },
      lg: {
        padding: '12px 24px',
      },
    },
    borderless: {
      false: {
        borderStyle: 'solid',
        borderWidth: '2px',
      },
      true: {},
    },
    fullWidth: {
      false: {},
      true: {
        width: '100%',
      },
    },
    active: {
      false: {},
      true: {},
    },
    variant: {
      default: {
        colorPalette: 'buttons.default',
      },
      light: {
        colorPalette: 'buttons.light',
      },
      filter: {
        colorPalette: 'buttons.filter',
        fontWeight: 'medium',
      },
      success: {
        colorPalette: 'buttons.success',
      },
      boost: {
        colorPalette: 'buttons.boost',
      },
      dark: {
        colorPalette: 'buttons.dark',
      },
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      borderless: false,
      css: {
        padding: '4px 12px',
      },
    },
    {
      size: 'lg',
      borderless: false,
      css: {
        padding: '10px 22px',
      },
    },
  ],
  defaultVariants: {
    size: 'lg',
    borderless: false,
    fullWidth: false,
    active: false,
  },
});
