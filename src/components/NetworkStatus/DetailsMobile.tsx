import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Footer, Layout, Main, ScrollableDrawer } from '../ScrollableDrawer/ScrollableDrawer.tsx';
import { styled } from '@repo/styles/jsx';
import { ChainRpcReset } from '../Header/components/UserSettings/RpcEdit.tsx';
import { Button } from '../Button/Button.tsx';
import type { ChainEntity } from '../../features/data/entities/chain.ts';

type DetailsMobileProps = {
  header: ReactNode;
  content: ReactNode;
  footer: ReactNode;
  open: boolean;
  handleClose: () => void;
  editChainId: ChainEntity['id'] | null;
  setEditChainId: (id: ChainEntity['id'] | null) => void;
};
export const DetailsMobile = memo(function DetailsMobile({
  open,
  handleClose,
  editChainId,
  setEditChainId,
  header,
  content,
  footer,
}: DetailsMobileProps) {
  const { t } = useTranslation();

  return (
    <ScrollableDrawer
      LayoutComponent={CustomLayout}
      MainComponent={CustomMain}
      FooterComponent={CustomFooter}
      mobileSpacingSize={0}
      open={open}
      onClose={handleClose}
      hideShadow={true}
      mainChildren={
        <>
          <TitleWrapper>{header}</TitleWrapper>
          <ScrollableRpcSettingsPanel>{content}</ScrollableRpcSettingsPanel>
        </>
      }
      footerChildren={
        <>
          <div>{footer}</div>
          <ActionButtons>
            {editChainId ?
              <>
                <ChainRpcReset onBack={() => setEditChainId(null)} value={editChainId} />
                <Button
                  variant="dark"
                  fullWidth={true}
                  borderless={true}
                  onClick={() => setEditChainId(null)}
                >
                  {t('RpcModal-Cancel')}
                </Button>
              </>
            : <Button variant="dark" fullWidth={true} borderless={true} onClick={handleClose}>
                {t('RpcModal-Close')}
              </Button>
            }
          </ActionButtons>
        </>
      }
    />
  );
});

const CustomLayout = styled(Layout, {
  base: {
    backgroundColor: 'background.content',
    borderTopRadius: '16px',
    height: 'calc(100dvh - 64px)',
    maxHeight: '100dvh',
    overflow: 'hidden',
  },
});

const CustomFooter = styled(Footer, {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    borderTopRadius: '12px',
    paddingInline: '12px',
    paddingBlock: '16px 24px',
    flexShrink: 0,
  },
});

const CustomMain = styled(Main, {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingInline: '12px',
    overflow: 'hidden',
  },
});

const TitleWrapper = styled('div', {
  base: {
    flexShrink: 0,
  },
});

const ScrollableRpcSettingsPanel = styled('div', {
  base: {
    flex: '1 1 auto',
    overflowY: 'auto',
    minHeight: 0,
  },
});

const ActionButtons = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    paddingInline: '8px',
  },
});
