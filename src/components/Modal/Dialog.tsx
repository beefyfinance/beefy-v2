import { styled } from '@repo/styles/jsx';
import { cva, type RecipeVariantProps } from '@repo/styles/css';

export type DialogVariantProps = NonNullable<RecipeVariantProps<typeof dialogRecipe>>;

const dialogRecipe = cva({
  base: {
    display: 'flex',
    minHeight: '0',
    minWidth: '0',
    maxWidth: '100%',
  },
  variants: {
    scrollable: {
      false: {
        maxHeight: '100%',
      },
    },
    position: {
      center: {
        margin: 'auto',
        padding: { sm: '24px' },
      },
      right: {
        marginLeft: 'auto',
      },
      left: {
        marginRight: 'auto',
      },
      bottom: {
        marginTop: 'auto',
      },
    },
  },
  defaultVariants: {
    scrollable: false,
    position: 'center',
  },
});

export const Dialog = styled('div', dialogRecipe);
