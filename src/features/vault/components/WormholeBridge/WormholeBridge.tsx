import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { styles } from './styles';
import { WormholeModal } from './WormholeModal';

const useStyles = makeStyles(styles);

export const WormholeBridge = memo(function WormholeBridge() {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === 'https://wormhole.beefy.finance' && event.data === 'wormhole:close') {
        handleClose();
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [handleClose]);

  return (
    <>
      <button onClick={handleOpen} className={classes.button}>
        open wormhole
      </button>
      <WormholeModal open={isOpen} onClose={handleClose} />
    </>
  );
});
