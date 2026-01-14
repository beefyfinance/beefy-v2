import { memo, useCallback } from 'react';
import { Drawer } from '../Modal/Drawer.tsx';
import { useBreakpoint } from '../../hooks/useBreakpoint.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import {
  selectWalletSelect,
  selectWalletSelectOpen,
} from '../../features/data/selectors/wallet.ts';
import { walletSelectClose } from '../../features/data/actions/wallet.ts';
import { StepError } from './StepError.tsx';
import { StepConnecting } from './StepConnecting.tsx';
import { StepWallets } from './StepWallets.tsx';
import { MobileStepLayout } from './MobileStepLayout.tsx';
import { DesktopStepLayout } from './DesktopStepLayout.tsx';

export const WalletSelect = memo(() => {
  const dispatch = useAppDispatch();
  const isDesktop = useBreakpoint({ from: 'md' });
  const isOpen = useAppSelector(selectWalletSelectOpen);
  const handleClose = useCallback(() => {
    dispatch(walletSelectClose());
  }, [dispatch]);

  return (
    <Drawer
      layer={1}
      position={isDesktop ? 'center' : 'bottom'}
      open={isOpen}
      onClose={handleClose}
    >
      {isOpen && <Content desktop={isDesktop} />}
    </Drawer>
  );
});

type ContentProps = {
  desktop: boolean;
};

const Content = memo(function Content({ desktop }: ContentProps) {
  const select = useAppSelector(selectWalletSelect);
  if (!select.open) {
    throw new Error('Content rendered when select is closed');
  }
  const StepLayout = desktop ? DesktopStepLayout : MobileStepLayout;

  switch (select.step) {
    case 'wallet':
      return <StepWallets Layout={StepLayout} grid={desktop} />;
    case 'connecting':
      return <StepConnecting Layout={StepLayout} select={select} hideIntroduction={!desktop} />;
    case 'error':
      return <StepError Layout={StepLayout} select={select} hideIntroduction={!desktop} />;
  }
});
