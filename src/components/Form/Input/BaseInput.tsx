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
      status:
        error ? 'error'
        : warning ? 'warning'
        : success ? 'success'
        : undefined,
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
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'purpleDarkest',
      color: 'text.middle',
      gap: '4px',
      flexWrap: 'nowrap',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: '8px',
      paddingInline: '12px',
      paddingBlock: '8px',
    },
    input: {
      textStyle: 'body.medium',
      backgroundColor: 'inherit',
      border: 'none',
      color: 'inherit',
      flexShrink: '1',
      flexGrow: '1',
      outline: 'none',
      '&::placeholder': {
        color: 'white.70-64a',
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
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: '0',
    flexGrow: '0',
    paddingInline: '0',
    color: 'text.dark',
  },
});
