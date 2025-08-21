import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollableDrawer, Layout, Main, Footer } from '../ScrollableDrawer/ScrollableDrawer.tsx';
import { styled } from '@repo/styles/jsx';
import { ChainRpcReset } from '../Header/components/UserSettings/RpcEdit.tsx';
import { Button } from '../Button/Button.tsx';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { RpcSettingsPanel } from '../Header/components/UserSettings/RpcSettingsPanel.tsx';
import { TitleComponent } from './Title.tsx';

export const MobileDrawer = memo(function MobileDrawer({
  open,
  handleClose,
  titleText,
  editChainId,
  setEditChainId,
  rpcErrors,
  hasAnyError,
}: {
  open: boolean;
  handleClose: () => void;
  titleText: string;
  editChainId: ChainEntity['id'] | null;
  setEditChainId: (id: ChainEntity['id'] | null) => void;
  rpcErrors: ChainEntity['id'][];
  hasAnyError: boolean;
}) {
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
          <TitleWrapper>
            <TitleComponent mobilelist={true} hasAnyError={hasAnyError} text={titleText} />
          </TitleWrapper>
          <ScrollableRpcSettingsPanel>
            <RpcSettingsPanel
              rpcErrors={rpcErrors}
              editChainId={editChainId}
              setEditChainId={setEditChainId}
            />
          </ScrollableRpcSettingsPanel>
        </>
      }
      footerChildren={
        <>
          <div>{t('RpcModal-EmptyList')}</div>
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
    flex: '1 1 auto',
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
