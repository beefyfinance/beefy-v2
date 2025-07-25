import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import { PanelContent } from './Panel.tsx';
import { Collapsable } from '../../../Collapsable/Collapsable.tsx';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

export const RpcSettingsPanel = memo(function RpcSettingsPanel() {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);

  return (
    <>
      {editChainId ?
        <RpcEdit chainId={editChainId} onBack={onBack} />
      : <CollapsableContainer
          titleClass={styles.title}
          collapsableClass={styles.collapsable}
          variant="noPadding"
          title={t('RpcModal-Menu-Edit')}
          openByDefault={true}
        >
          <PanelContent>
            <RpcMenu onSelect={setEditChainId} />
          </PanelContent>
        </CollapsableContainer>
      }
    </>
  );
});

const CollapsableContainer = styled(Collapsable, {
  base: {
    paddingBlock: '6px',
    paddingInline: '10px',
  },
});

const styles = {
  title: css.raw({
    paddingBlock: '6px',
    paddingInline: '10px',
  }),
  collapsable: css.raw({
    gap: 0,
  }),
};
