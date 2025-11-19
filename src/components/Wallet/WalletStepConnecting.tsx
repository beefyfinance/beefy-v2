import { memo, useCallback } from 'react';
import type { SelectConnecting } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectBack } from '../../features/data/actions/wallet.ts';
import type { BaseWalletStepProps } from './types.ts';
import { Button } from '../Button/Button.tsx';
import { WalletStepConnectingQR } from './WalletStepConnectingQR.tsx';
import { Box } from './Box.tsx';
import { WalletIcon } from './WalletIcon.tsx';

export type WalletStepConnectingProps = BaseWalletStepProps & {
  select: SelectConnecting;
};

export const WalletStepConnecting = memo(function WalletStepConnecting({
  Layout,
  select,
}: WalletStepConnectingProps) {
  const { wallet } = select;
  const dispatch = useAppDispatch();
  const handleCancel = useCallback(() => {
    dispatch(walletSelectBack());
  }, [dispatch]);

  return (
    <Layout
      title={wallet.name}
      main={
        <Box>
          {wallet.ui === 'external' && <WalletStepConnectingExternal {...select} />}
          {wallet.ui === 'embed' && <WalletStepConnectingEmbed {...select} />}
          {wallet.ui === 'qr' && <WalletStepConnectingQR {...select} />}
        </Box>
      }
      footer={
        <Button onClick={handleCancel} fullWidth={true}>
          Cancel
        </Button>
      }
    />
  );
});

const WalletStepConnectingExternal = memo(function WalletStepConnectingExternal({
  wallet: { iconUrl, iconBackground },
}: SelectConnecting) {
  return (
    <>
      <WalletIcon src={iconUrl} background={iconBackground} size={48} />
      <div>Continue in provider wallet...</div>
    </>
  );
});

const WalletStepConnectingEmbed = memo(function WalletStepConnectingEmbed({
  wallet: { iconUrl, iconBackground },
}: SelectConnecting) {
  return (
    <>
      <WalletIcon src={iconUrl} background={iconBackground} size={48} />
      <div>Continue in provider model...</div>
    </>
  );
});
