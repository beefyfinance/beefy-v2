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
    <>
      {editChainId ?
        <RpcEdit chainId={editChainId} onBack={onBack} />
      : <PanelContent>
          <RpcMenu rpcErrors={rpcErrors} onSelect={setEditChainId} />
        </PanelContent>
      }
    </>
  );
});

export const PanelContent = styled('div', {
  base: {
    height: '500px',
    padding: 0,
    sm: {
      height: '350px',
    },
  },
});

// const CollapsableContainer = styled(Collapsable, {
//   base: {
//     paddingBlock: '6px',
//     paddingInline: '10px',
//   },
// });

// const styles = {
//   title: css.raw({
//     paddingBlock: '6px',
//     paddingInline: '10px',
//   }),
//   collapsable: css.raw({
//     height: '100%',
//     gap: 0,
//     lg: {
//       height: 'auto',
//     },
//   }),
// };
