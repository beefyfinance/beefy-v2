import { memo, useCallback } from 'react';
import { WalletList } from './WalletList.tsx';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectClose } from '../../features/data/actions/wallet.ts';
import { Button } from '../Button/Button.tsx';
import type { BaseWalletStepProps } from './types.ts';
import { Box } from './Box.tsx';

type StepWalletsProps = BaseWalletStepProps & {
  grid: boolean;
};

export const StepWallets = memo(function StepWallets({
  Layout,
  grid,
  hideIntroduction = false,
}: StepWalletsProps) {
  const dispatch = useAppDispatch();
  const handleClose = useCallback(() => {
    dispatch(walletSelectClose());
  }, [dispatch]);

  return (
    <Layout
      content={
        <Box noPadding={true} align="top" title="Select wallet provider">
          <WalletList grid={grid} />
        </Box>
      }
      button={
        <Button onClick={handleClose} fullWidth={true}>
          Close
        </Button>
      }
      hideIntroduction={hideIntroduction}
    />
  );
});
