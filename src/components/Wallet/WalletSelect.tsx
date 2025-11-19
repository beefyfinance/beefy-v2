import { memo, type ReactNode, useCallback } from 'react';
import { Drawer } from '../Modal/Drawer.tsx';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import {
  selectWalletSelect,
  selectWalletSelectOpen,
} from '../../features/data/selectors/wallet.ts';
import { walletSelectClose } from '../../features/data/actions/wallet.ts';
import { WalletStepError } from './WalletStepError.tsx';
import { WalletStepConnecting } from './WalletStepConnecting.tsx';
import { WalletStepWallet } from './WalletStepWallet.tsx';
import { styled } from '@repo/styles/jsx';

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
  const StepLayout = desktop ? MobileStepLayout : MobileStepLayout;

  return (
    <Layout desktop={desktop}>
      {select.step === 'wallet' && <WalletStepWallet Layout={StepLayout} grid={desktop} />}
      {select.step === 'connecting' && <WalletStepConnecting Layout={StepLayout} select={select} />}
      {select.step === 'error' && <WalletStepError Layout={StepLayout} select={select} />}
    </Layout>
  );
});

type MobileStepLayoutProps = {
  title: string;
  description?: ReactNode;
  main: ReactNode;
  footer?: ReactNode;
};

const MobileStepLayout = memo(function MobileStepLayout({
  title,
  description,
  main,
  footer,
}: MobileStepLayoutProps) {
  return (
    <>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {main}
      {footer && <div>{footer}</div>}
    </>
  );
});

const Layout = styled('div', {
  base: {
    background: 'background.content.darkest',
    borderTopRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh',
    minHeight: 0,
    padding: '16px',
    gap: '12px',
  },
  variants: {
    desktop: {
      true: {
        borderRadius: '16px',
        width: 'container.sm',
        maxWidth: '100%',
        height: 'container.sm',
        maxHeight: '80vh',
        minHeight: '360px',
      },
    },
  },
});
