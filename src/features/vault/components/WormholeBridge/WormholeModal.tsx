import { makeStyles } from '@material-ui/core';
import React, {
  memo,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { styles } from './styles';
import { Modal } from '../../../../components/Modal';
import { TechLoader } from '../../../../components/TechLoader';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type WormholeModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WormholeModal = memo<WormholeModalProps>(function WormholeModal({ open, onClose }) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const backRef = useRef<HTMLDivElement>(null);

  const handleBackClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      if (e.target === backRef.current) {
        onClose();
      }
    },
    [onClose, backRef]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === 'https://wormhole.beefy.finance') {
        if (event.data === 'wormhole:close') {
          onClose();
        } else if (event.data === 'wormhole:loaded') {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [onClose, setIsLoading]);

  return (
    <Modal open={open} onClose={onClose}>
      {open ? (
        <div className={classes.positioner} onClick={handleBackClick} ref={backRef}>
          <div className={classes.sizer}>
            <TechLoader className={clsx(classes.loader, { [classes.loading]: isLoading })} />
            <iframe
              src="https://wormhole.beefy.finance"
              className={clsx(classes.embed, { [classes.loading]: isLoading })}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </Modal>
  );
});
