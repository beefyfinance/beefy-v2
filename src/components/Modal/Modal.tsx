import { memo } from 'react';
import { Modal as MuiModal, ModalProps as MuiModalProps } from '@material-ui/core';

const backdropProps: MuiModalProps['BackdropProps'] = {
  style: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)',
  },
};

export type ModalProps = Omit<MuiModalProps, 'BackdropComponent' | 'BackdropProps'>;
export const Modal = memo<ModalProps>(function ({ children, ...rest }) {
  return <MuiModal {...rest} children={children} BackdropProps={backdropProps} />;
});
