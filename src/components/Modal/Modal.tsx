import { memo, type ReactNode } from 'react';
import { Overlay } from './Overlay.tsx';
import { Dialog } from './Dialog.tsx';

export type ModalProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
};

export const Modal = memo<ModalProps>(function Modal({ open, children, ...rest }) {
  if (!open) {
    return null;
  }

  return (
    <Overlay {...rest}>
      <Dialog scrollable={rest.scrollable}>{children}</Dialog>
    </Overlay>
  );
});
