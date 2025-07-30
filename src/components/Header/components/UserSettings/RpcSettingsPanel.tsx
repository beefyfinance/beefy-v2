import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import { Collapsable } from '../../../Collapsable/Collapsable.tsx';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectAllChainIds } from '../../../../features/data/selectors/chains.ts';
import { ChainRpcItem } from './RpcListItem.tsx';
import { useBreakpoint } from '../../../MediaQueries/useBreakpoint.ts';

export const RpcSettingsPanel = memo(function RpcSettingsPanel({
  rpcErrors,
  editChainId,
  setEditChainId,
}: {
  rpcErrors: ChainEntity['id'][];
  editChainId: ChainEntity['id'] | null;
  setEditChainId: (chainId: ChainEntity['id'] | null) => void;
}) {
  const { t } = useTranslation();

  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const isMobile = useBreakpoint({ to: 'xs' });

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
          {isMobile ?
            <>
              <div className={css(styles.title)}>
                {t('RpcModal-Menu-Edit', { count: connectedChainIds })}
              </div>
              <RpcMenu rpcErrors={rpcErrors} onSelect={setEditChainId} />
            </>
          : <CollapsableContainer
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
          }
        </>
      }
    </>
  );
});

export const PanelContent = styled('div', {
  base: {
    height: '350px',
    padding: 0,
  },
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
    height: '100%',
    gap: 0,
    lg: {
      height: 'auto',
    },
  }),
};
