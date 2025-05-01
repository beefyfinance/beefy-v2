import { memo, type ReactNode } from 'react';
import { useTooltipContext } from './useTooltipContext.ts';
import { FloatingArrow, FloatingPortal } from '@floating-ui/react';
import { styled } from '@repo/styles/jsx';

type TooltipContentProps = {
  children: ReactNode;
  className?: string;
};

export const TooltipContent = memo(function TooltipContent({
  children,
  className,
}: TooltipContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, context, arrow, variant, layer, size } =
    useTooltipContext();

  if (!open) {
    return null;
  }

  return (
    <FloatingPortal>
      <TooltipOuter
        ref={refs.setFloating}
        {...getFloatingProps()}
        style={floatingStyles}
        variant={variant}
        layer={layer}
        className={className}
      >
        <TooltipArrow {...arrow} context={context} />
        <TooltipInner size={size}>{children}</TooltipInner>
      </TooltipOuter>
    </FloatingPortal>
  );
});

const TooltipOuter = styled('div', {
  base: {
    minWidth: '36px',
    maxWidth: 'min(calc(100vw - 32px), 440px)',
  },
  variants: {
    variant: {
      light: {
        colorPalette: 'tooltip.light',
      },
      dark: {
        colorPalette: 'tooltip.dark',
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
    variant: 'light',
  },
});

const TooltipArrow = styled(FloatingArrow, {
  base: {
    fill: 'colorPalette.background',
  },
});

const TooltipInner = styled('div', {
  base: {
    background: 'colorPalette.background',
    color: 'colorPalette.text',
    textStyle: 'body',
    paddingBlock: 'var(--tooltip-content-vertical-padding, 12px)',
    paddingInline: 'var(--tooltip-content-horizontal-padding, 16px)',
    minWidth: '50px',
    borderRadius: 'var(--tooltip-content-border-radius, 8px)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 8px 8px {colors.tooltipDropdownBoxShadow}',
  },
  variants: {
    size: {
      normal: {},
      compact: {
        '--tooltip-content-vertical-padding': '8px',
        '--tooltip-content-horizontal-padding': '8px',
        '--tooltip-content-vertical-gap': '4px',
        '--tooltip-content-horizontal-gap': '12px',
        '--tooltip-content-border-radius': '4px',
        textStyle: 'body.sm',
      },
    },
  },
  defaultVariants: {
    size: 'normal',
  },
});
