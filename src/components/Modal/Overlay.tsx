import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';
import { memo, type MouseEvent, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type BackdropProps = StyledVariantProps<typeof Backdrop>;

export type OverlayProps = BackdropProps & {
  onClose: () => void;
  children: ReactNode;
};

export const Overlay = memo(function Overlay({ onClose, children, ...rest }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (ref.current) {
      const elm = ref.current;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && e.target && e.target instanceof Element) {
          if (!['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(e.target.nodeName)) {
            e.stopImmediatePropagation();
            onClose();
          }
        }
      };
      elm.addEventListener('keydown', handleKeyDown);
      return () => elm.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return createPortal(
    <Backdrop {...rest} ref={ref} onClick={handleClick} className={'disable-scroll'}>
      {children}
    </Backdrop>,
    document.body
  );
});

const Backdrop = styled('div', {
  base: {
    display: 'flex',
    position: 'fixed',
    backgroundColor: 'modal.backdrop',
    backdropFilter: 'blur(8px)',
    width: '100%',
    height: '100%',
    inset: 0,
    touchAction: 'none',
  },
  variants: {
    scrollable: {
      true: {
        overflowY: 'auto',
      },
    },
    layer: {
      0: {
        zIndex: 'modal',
      },
      1: {
        zIndex: 'layer1.modal',
      },
      2: {
        zIndex: 'layer2.modal',
      },
    },
  },
  defaultVariants: {
    layer: 0,
    scrollable: false,
  },
});
