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
          <TitleComponent mobilelist={true} hasAnyError={hasAnyError} text={titleText} />
          <ListMobile>
            <RpcSettingsPanel
              rpcErrors={rpcErrors}
              editChainId={editChainId}
              setEditChainId={setEditChainId}
            />
          </ListMobile>
        </>
      }
      footerChildren={
        <>
          <div>{t('RpcModal-EmptyList')}</div>
          {editChainId ?
            <ActionButtons>
              <ChainRpcReset onBack={() => setEditChainId(null)} value={editChainId} />
              <Button
                variant="dark"
                fullWidth={true}
                borderless={true}
                onClick={() => setEditChainId(null)}
              >
                {t('RpcModal-Cancel')}
              </Button>
            </ActionButtons>
          : <Button variant="dark" fullWidth={true} borderless={true} onClick={handleClose}>
              {t('RpcModal-Close')}
            </Button>
          }
        </>
      }
    />
  );
});

const CustomLayout = styled(Layout, {
  base: {
    backgroundColor: 'background.content',
    borderTopRadius: '16px',
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
    paddingBlock: '16px',
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

const ListMobile = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    backgroundColor: 'background.content.dark',
  },
});

const ActionButtons = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
});
