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
      disabled,
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
      <div
        className={cx('BaseInput-root', classes.root, className)}
        ref={ref}
        data-disabled={disabled ? '' : undefined}
      >
        {startAdornment && <Adornments data-slot="adornments">{startAdornment}</Adornments>}
        <input
          {...inputProps}
          ref={inputRef}
          disabled={disabled}
          className={cx('BaseInput-input', classes.input)}
        />
        {endAdornment && <Adornments data-slot="adornments">{endAdornment}</Adornments>}
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
      _focusWithin: {
        color: 'text.light',
      },
      '&[data-disabled]': {
        opacity: '0.5',
        pointerEvents: 'none',
      },
      '& [data-slot="adornments"]': {
        color: 'inherit',
      },
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
        color: 'inherit',
      },
      _disabled: {
        cursor: 'not-allowed',
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
      transparent: {
        root: {
          backgroundColor: 'transparent',
          paddingInline: '0',
          paddingBlock: '0',
          height: '20px',
          alignItems: 'flex-end',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          color: 'text.dark',
          _hover: {
            color: 'text.middle',
          },
          _focusWithin: {
            color: 'text.light',
          },
          '&[data-disabled]': {
            opacity: '0.5',
            pointerEvents: 'none',
          },
          '& [data-slot="adornments"]': {
            color: 'inherit',
          },
        },
        input: {
          height: '20px',
          caretColor: 'indicators.success',
          color: 'inherit',
          backgroundColor: 'transparent',
          '&::placeholder': {
            textStyle: 'label',
            opacity: '0.64',
            color: 'inherit',
            fontWeight: 500,
            textDecoration: 'underline',
            textDecorationColor: 'inherit',
            textDecorationThickness: '0.5px',
            textUnderlineOffset: '2px',
          },
          '&:not(:placeholder-shown)': {
            textDecoration: 'underline',
            textDecorationColor: 'inherit',
            textDecorationThickness: '0.5px',
            textUnderlineOffset: '2px',
          },
          _focus: {
            color: 'inherit',
          },
          _disabled: {
            cursor: 'not-allowed',
          },
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
