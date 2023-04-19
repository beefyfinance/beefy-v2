import { memo } from 'react';
import type { ModalProps as MuiModalProps } from '@material-ui/core';
import { Modal as MuiModal } from '@material-ui/core';

const backdropProps: MuiModalProps['BackdropProps'] = {
  style: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)',
  },
};

export type ModalProps = Omit<MuiModalProps, 'BackdropComponent' | 'BackdropProps'>;
export const Modal = memo<ModalProps>(function Modal({ children, ...rest }) {
  return <MuiModal {...rest} children={children} BackdropProps={backdropProps} />;
});
