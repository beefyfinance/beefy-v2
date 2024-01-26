import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { styles } from './styles';
import { Modal } from '../../../../components/Modal';

const useStyles = makeStyles(styles);

export type WormholeModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WormholeModal = memo<WormholeModalProps>(function WormholeModal({ open, onClose }) {
  const classes = useStyles();

  return (
    <Modal open={open} onClose={onClose} tabIndex={-1}>
      {open ? (
        <div className={classes.container}>
          <iframe src="https://wormhole.beefy.finance" className={classes.embed} />
        </div>
      ) : (
        <></>
      )}
    </Modal>
  );
});
