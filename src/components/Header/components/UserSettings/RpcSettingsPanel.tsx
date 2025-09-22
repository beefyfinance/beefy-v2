import { memo, useCallback } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { RpcEdit } from './RpcEdit.tsx';
import { RpcMenu } from './RpcMenu.tsx';
import { styled } from '@repo/styles/jsx';

export const RpcSettingsPanel = memo(function RpcSettingsPanel({
  rpcErrors,
  editChainId,
  setEditChainId,
}: {
  rpcErrors: ChainEntity['id'][];
  editChainId: ChainEntity['id'] | null;
  setEditChainId: (chainId: ChainEntity['id'] | null) => void;
}) {
  const onBack = useCallback(() => {
    setEditChainId(null);
  }, [setEditChainId]);

  return (
    <Container edit={!!editChainId}>
      {editChainId ?
        <RpcEdit chainId={editChainId} onBack={onBack} />
      : <PanelContent>
          <RpcMenu rpcErrors={rpcErrors} onSelect={setEditChainId} />
        </PanelContent>
      }
    </Container>
  );
});

const Container = styled('div', {
  base: {
    borderRadius: '8px',
    backgroundColor: 'background.content.dark',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    edit: {
      true: {
        height: 'auto',
      },
    },
  },
});

export const PanelContent = styled('div', {
  base: {
    flex: '1 1 auto',
    padding: 0,
    overflow: 'hidden',
    sm: {
      height: '350px',
    },
  },
});
