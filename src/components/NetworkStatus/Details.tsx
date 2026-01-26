import { memo, useMemo, useState } from 'react';
import type { ChainId } from '../../features/data/entities/chain.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { selectStatusNotifications } from '../../features/data/selectors/data-loader-helpers.ts';
import { DetailsMobile } from './DetailsMobile.tsx';
import { DetailsDesktop } from './DetailsDesktop.tsx';
import { Header } from './Header.tsx';
import { RpcSettingsPanel } from '../Header/components/UserSettings/RpcSettingsPanel.tsx';
import { useTranslation } from 'react-i18next';

type DetailsProps = {
  onClose: () => void;
  isMobile: boolean;
};

export const Details = memo(function Details({ onClose, isMobile }: DetailsProps) {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainId | null>(null);
  const notifications = useAppSelector(selectStatusNotifications);
  const rpcErrorChains = useMemo(() => {
    const { rpc } = notifications;
    return rpc ? rpc.chainIds : [];
  }, [notifications]);
  const header = <Header isMobile={isMobile} notifications={notifications} />;
  const content = (
    <RpcSettingsPanel
      chainsWithErrors={rpcErrorChains}
      editChainId={editChainId}
      setEditChainId={setEditChainId}
    />
  );
  const footer = t('RpcModal-Footnote');

  return isMobile ?
      <DetailsMobile
        header={header}
        content={content}
        footer={footer}
        open={true}
        handleClose={onClose}
        editChainId={editChainId}
        setEditChainId={setEditChainId}
      />
    : <DetailsDesktop header={header} content={content} footer={footer} />;
});
