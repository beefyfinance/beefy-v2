import { memo, MutableRefObject, ReactNode, useLayoutEffect, useMemo } from 'react';
import {
  autoUpdate,
  flip,
  hide,
  offset,
  Placement,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom';

export type FloatingProps = {
  open: boolean;
  anchorEl: MutableRefObject<HTMLElement>;
  children: ReactNode;
  className?: string;
  placement?: Placement;
  autoHeight?: boolean;
  autoWidth?: boolean;
  autoHide?: boolean;
  display?: string;
};
export const Floating = memo<FloatingProps>(function Floating({
  open = false,
  anchorEl,
  className,
  children,
  placement = 'bottom-start',
  autoHeight = true,
  autoWidth = true,
  autoHide = true,
  display = 'block',
}) {
  const middleware = useMemo(() => {
    const middlewares = [];
    if (autoHide) {
      middlewares.push(hide());
    }

    middlewares.push(offset(4));
    middlewares.push(shift());
    middlewares.push(flip());

    if (autoWidth || autoHeight) {
      middlewares.push(
        size({
          padding: 16,
          apply({ availableWidth, availableHeight, elements }) {
            if (autoWidth) {
              elements.floating.style.width = elements.reference.offsetWidth + 'px';
              elements.floating.style.maxWidth = availableWidth + 'px';
            }
            if (autoHeight) {
              elements.floating.style.maxHeight = availableHeight + 'px';
            }
          },
        })
      );
    }
    return middlewares;
  }, [autoHide, autoWidth, autoHeight]);
  const { x, y, reference, floating, strategy, middlewareData } = useFloating({
    whileElementsMounted: autoUpdate,
    placement,
    middleware,
  });

  const anchorElCurrent = anchorEl.current;
  useLayoutEffect(() => {
    reference(anchorElCurrent);
  }, [reference, anchorElCurrent]);

  return open ? (
    <div
      className={className}
      ref={floating}
      style={{
        position: strategy,
        top: y ?? '',
        left: x ?? '',
        display: middlewareData.hide?.referenceHidden ? 'none' : display,
      }}
    >
      {children}
    </div>
  ) : null;
});
