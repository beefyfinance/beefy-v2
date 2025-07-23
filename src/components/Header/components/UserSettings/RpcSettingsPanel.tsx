import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import { Panel, PanelContent, PanelHeader, PanelTitle } from './Panel.tsx';

export const RpcSettingsPanel = memo(function RpcSettingsPanel() {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>{t('RpcModal-Menu-Edit')}</PanelTitle>
      </PanelHeader>
      <PanelContent>
        {editChainId ?
          <RpcEdit chainId={editChainId} onBack={onBack} />
        : <RpcMenu onSelect={setEditChainId} />}
      </PanelContent>
    </Panel>
  );
});
