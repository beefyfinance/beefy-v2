import { memo, type ReactNode } from 'react';
import { Overlay } from './Overlay.tsx';
import { Dialog, type DialogVariantProps } from './Dialog.tsx';

export type DrawerProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  position?: DialogVariantProps['position'];
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
};

export const Drawer = memo<DrawerProps>(function Drawer({
  open,
  children,
  position = 'right',
  ...rest
}) {
  if (!open) {
    return null;
  }

  return (
    <Overlay {...rest}>
      <Dialog scrollable={rest.scrollable} position={position}>
        {children}
      </Dialog>
    </Overlay>
  );
});
