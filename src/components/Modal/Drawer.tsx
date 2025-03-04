import { memo, type ReactNode } from 'react';
import { Overlay } from './Overlay.tsx';
import { Dialog } from './Dialog.tsx';

export type DrawerProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
};

export const Drawer = memo<DrawerProps>(function Drawer({ open, children, ...rest }) {
  if (!open) {
    return null;
  }

  return (
    <Overlay {...rest}>
      <Dialog scrollable={rest.scrollable} position={'right'}>
        {children}
      </Dialog>
    </Overlay>
  );
});
