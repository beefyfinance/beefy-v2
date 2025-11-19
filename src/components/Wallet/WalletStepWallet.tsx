import { memo, useCallback } from 'react';
import { WalletList } from './WalletList.tsx';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectClose } from '../../features/data/actions/wallet.ts';
import { Button } from '../Button/Button.tsx';
import type { BaseWalletStepProps } from './types.ts';
import { Box } from './Box.tsx';

type WalletStepWalletProps = BaseWalletStepProps & {
  grid: boolean;
};

export const WalletStepWallet = memo(function WalletStepWallet({
  Layout,
  grid,
}: WalletStepWalletProps) {
  const dispatch = useAppDispatch();
  const handleClose = useCallback(() => {
    dispatch(walletSelectClose());
  }, [dispatch]);

  return (
    <Layout
      title="Connect your wallet"
      description={
        <>
          Connecting your wallet is like “logging in” to Web3. Select your wallet from the options
          to get started.
        </>
      }
      main={
        <Box noPadding={true} align="top">
          <WalletList grid={grid} />
        </Box>
      }
      footer={
        <Button onClick={handleClose} fullWidth={true}>
          Close
        </Button>
      }
    />
  );
});
