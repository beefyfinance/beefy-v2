import { memo, type ReactNode } from 'react';
import { useDropdownContext } from './useDropdownContext.ts';
import { FloatingArrow, FloatingPortal } from '@floating-ui/react';
import { type HTMLStyledProps, styled } from '@repo/styles/jsx';

export type DropdownContentProps = {
  children: ReactNode;
} & Omit<HTMLStyledProps<typeof DropdownInner>, 'children' | 'className'>;

export const DropdownContent = memo(function DropdownContent(innerProps: DropdownContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, context, arrow, variant, layer } =
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
        layer={layer}
      >
        {arrow && <DropdownArrow {...arrow} context={context} />}
        <DropdownInner {...innerProps} />
      </DropdownOuter>
    </FloatingPortal>
  );
});

const DropdownOuter = styled('div', {
  base: {
    colorPalette: 'dropdown.base',
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
      button: {
        colorPalette: 'dropdown.button',
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
    minWidth: '50px',
    borderRadius: '8px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 8px 8px {colors.tooltipDropdownBoxShadow}',
  },
  variants: {
    padding: {
      none: {
        padding: '0',
      },
      small: {
        padding: '8px',
      },
      normal: {
        padding: '16px',
      },
      large: {
        padding: '24px',
      },
    },
    gap: {
      none: {
        gap: '0',
      },
      small: {
        gap: '6px',
      },
      normal: {
        gap: '12px',
      },
      large: {
        gap: '18px',
      },
    },
  },
  defaultVariants: {
    padding: 'normal',
    gap: 'normal',
  },
});
