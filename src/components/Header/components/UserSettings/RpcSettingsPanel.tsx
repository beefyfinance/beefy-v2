import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import BackArrow from '../../../../images/back-arrow.svg?react';
import CloseIcon from '../../../../images/icons/mui/Close.svg?react';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import {
  PanelBackButton,
  PanelCloseButton,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from './Panel.tsx';

export const RpcSettingsPanel = memo(function RpcSettingsModal({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);
  const showStepBack = editChainId !== null;

  return (
    <Panel>
      <PanelHeader>
        {showStepBack && (
          <PanelBackButton onClick={onBack}>
            <BackArrow width={12} height={9} />
          </PanelBackButton>
        )}
        <PanelTitle>{t('RpcModal-Menu-Edit')}</PanelTitle>
        <PanelCloseButton onClick={handleClose}>
          <CloseIcon />
        </PanelCloseButton>
      </PanelHeader>
      <PanelContent>
        {editChainId ?
          <RpcEdit chainId={editChainId} onBack={onBack} />
        : <RpcMenu onSelect={setEditChainId} />}
      </PanelContent>
    </Panel>
  );
});
