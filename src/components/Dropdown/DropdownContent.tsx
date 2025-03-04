import { memo, type ReactNode } from 'react';
import { useDropdownContext } from './useDropdownContext.ts';
import { FloatingArrow, FloatingPortal } from '@floating-ui/react';
import { type HTMLStyledProps, styled } from '@repo/styles/jsx';

type DropdownContentProps = {
  children: ReactNode;
} & Omit<HTMLStyledProps<typeof DropdownInner>, 'children' | 'className'>;

export const DropdownContent = memo(function DropdownContent(innerProps: DropdownContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, context, arrow, variant, size } =
    useDropdownContext();

  if (!open) {
    return null;
  }

  return (
    <FloatingPortal>
      <DropdownOuter
        ref={refs.setFloating}
        {...getFloatingProps()}
        style={floatingStyles}
        variant={variant}
      >
        {arrow && <DropdownArrow {...arrow} context={context} />}
        <DropdownInner size={size} {...innerProps} />
      </DropdownOuter>
    </FloatingPortal>
  );
});

const DropdownOuter = styled('div', {
  base: {
    colorPalette: 'dropdown',
    minWidth: '36px',
    maxWidth: 'min(calc(100vw - 32px), 440px)',
  },
  variants: {
    variant: {
      light: {
        colorPalette: 'dropdown.light',
      },
      dark: {
        colorPalette: 'dropdown.dark',
      },
    },
    layer: {
      0: {
        zIndex: 'dropdown',
      },
      1: {
        zIndex: 'layer1.dropdown',
      },
      2: {
        zIndex: 'layer2.dropdown',
      },
    },
  },
  defaultVariants: {
    layer: 0,
  },
});

const DropdownArrow = styled(FloatingArrow, {
  base: {
    fill: 'colorPalette.background',
  },
});

const DropdownInner = styled('div', {
  base: {
    background: 'colorPalette.background',
    color: 'colorPalette.text',
    textStyle: 'body',
    paddingBlock: '12px',
    paddingInline: '16px',
    minWidth: '50px',
    borderRadius: '8px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 8px 8px {colors.blacko20}',
  },
  variants: {
    size: {
      none: {
        paddingBlock: '0',
        paddingInline: '0',
      },
      normal: {},
      compact: {
        textStyle: 'body.sm',
        paddingBlock: '8px',
        paddingInline: '8px',
      },
    },
  },
  defaultVariants: {
    size: 'normal',
  },
});
