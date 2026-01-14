import { memo, useCallback } from 'react';
import type { SelectConnecting } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { walletSelectBack } from '../../features/data/actions/wallet.ts';
import type { BaseWalletStepProps } from './types.ts';
import { Button } from '../Button/Button.tsx';
import { StepConnectingQR } from './StepConnectingQR.tsx';
import { WalletIcon } from './WalletIcon.tsx';
import { Box } from './Box.tsx';

export type StepConnectingProps = BaseWalletStepProps & {
  select: SelectConnecting;
};

export const StepConnecting = memo(function StepConnecting({
  Layout,
  select,
  hideIntroduction = false,
}: StepConnectingProps) {
  const { wallet } = select;
  const dispatch = useAppDispatch();
  const handleCancel = useCallback(() => {
    dispatch(walletSelectBack());
  }, [dispatch]);

  return (
    <Layout
      content={
        <Box title={wallet.name} iconUrl={select.wallet.iconUrl}>
          {wallet.ui === 'external' && <StepConnectingExternal {...select} />}
          {wallet.ui === 'embed' && <StepConnectingEmbed {...select} />}
          {wallet.ui === 'qr' && <StepConnectingQR {...select} />}
        </Box>
      }
      button={
        <Button onClick={handleCancel} fullWidth={true}>
          Cancel
        </Button>
      }
      hideIntroduction={hideIntroduction}
    />
  );
});

const StepConnectingExternal = memo(function StepConnectingExternal({
  wallet: { iconUrl, iconBackground },
}: SelectConnecting) {
  return (
    <>
      <WalletIcon src={iconUrl} background={iconBackground} size={48} loading={true} />
      <div>Continue in provider wallet...</div>
    </>
  );
});

const StepConnectingEmbed = memo(function StepConnectingEmbed({
  wallet: { iconUrl, iconBackground },
}: SelectConnecting) {
  return (
    <>
      <WalletIcon src={iconUrl} background={iconBackground} size={48} loading={true} />
      <div>Continue in provider model...</div>
    </>
  );
});
