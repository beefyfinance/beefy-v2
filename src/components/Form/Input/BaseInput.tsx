import { type ComponentPropsWithoutRef, forwardRef, memo, type ReactNode, type Ref } from 'react';
import { styled } from '@repo/styles/jsx';
import type { RecipeVariantProps } from '@repo/styles/types';
import { cx, sva } from '@repo/styles/css';

export type BaseInputProps = CustomProps &
  Omit<ComponentPropsWithoutRef<'input'>, keyof CustomProps>;

export const BaseInput = memo(
  forwardRef<HTMLDivElement, BaseInputProps>(function BaseInput(
    {
      startAdornment,
      endAdornment,
      className,
      error = false,
      warning = false,
      success = false,
      inputRef,
      ...rest
    },
    ref
  ) {
    const [recipeProps, inputProps] = recipe.splitVariantProps(rest);
    const classes = recipe({
      ...recipeProps,
      status: error ? 'error' : warning ? 'warning' : success ? 'success' : undefined,
    });

    return (
      <div className={cx('BaseInput-root', classes.root, className)} ref={ref}>
        {startAdornment && <Adornments>{startAdornment}</Adornments>}
        <input {...inputProps} ref={inputRef} className={cx('BaseInput-input', classes.input)} />
        {endAdornment && <Adornments>{endAdornment}</Adornments>}
      </div>
    );
  })
);

type RecipeProps = Omit<NonNullable<RecipeVariantProps<typeof recipe>>, 'status'>;

type ExtraProps = {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};

type CustomProps = ExtraProps & RecipeProps;

const recipe = sva({
  slots: ['root', 'input'],
  base: {
    root: {
      '--input-border-width': '1px', // TODO move to theme tokens
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'purpleDarkest',
      color: 'text.middle',
      gap: '8px',
      flexWrap: 'nowrap',
      borderWidth: 'var(--input-border-width)',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: '8px',
      paddingInline: 'calc(12px - var(--input-border-width))',
      paddingBlock: '0',
    },
    input: {
      textStyle: 'body.med',
      backgroundColor: 'inherit',
      border: 'none',
      paddingInline: '0',
      paddingBlock: 'calc(8px - var(--input-border-width))',
      color: 'inherit',
      flexShrink: '1',
      flexGrow: '1',
      outline: 'none',
      '&::placeholder': {
        color: 'text.dark',
        opacity: '1',
      },
      _focus: {
        color: 'text.light',
      },
    },
  },
  variants: {
    variant: {
      default: {},
      amount: {
        input: {
          textStyle: 'h2',
        },
      },
    },
    fullWidth: {
      true: {
        root: {
          width: '100%',
        },
      },
    },
    status: {
      false: {},
      error: {
        root: {
          borderColor: 'indicators.error',
        },
      },
      warning: {
        root: {
          borderColor: 'indicators.warning',
        },
      },
      success: {
        root: {
          borderColor: 'indicators.success',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    fullWidth: false,
    status: false,
  },
});

const Adornments = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '0',
    flexGrow: '0',
    paddingInline: '0',
    paddingBlock: '8px',
  },
});
