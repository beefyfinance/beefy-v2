import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import { PanelContent } from './Panel.tsx';
import { Collapsable } from '../../../Collapsable/Collapsable.tsx';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectAllChainIds } from '../../../../features/data/selectors/chains.ts';
import { ChainRpcItem } from './RpcListItem.tsx';

export const RpcSettingsPanel = memo(function RpcSettingsPanel({
  rpcErrors,
}: {
  rpcErrors: ChainEntity['id'][];
}) {
  const { t } = useTranslation();
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);

  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const connectedChainIds = useMemo(() => {
    return chainIds.length - rpcErrors.length;
  }, [chainIds, rpcErrors]);

  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);

  return (
    <>
      {editChainId ?
        <RpcEdit chainId={editChainId} onBack={onBack} />
      : <>
          {rpcErrors.length > 0 &&
            rpcErrors.map(chainId => (
              <ChainRpcItem error={true} key={chainId} id={chainId} onSelect={setEditChainId} />
            ))}
          <CollapsableContainer
            titleClass={styles.title}
            collapsableClass={styles.collapsable}
            variant="noPadding"
            title={t('RpcModal-Menu-Edit', { count: connectedChainIds })}
            openByDefault={true}
          >
            <PanelContent>
              <RpcMenu rpcErrors={rpcErrors} onSelect={setEditChainId} />
            </PanelContent>
          </CollapsableContainer>
        </>
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
