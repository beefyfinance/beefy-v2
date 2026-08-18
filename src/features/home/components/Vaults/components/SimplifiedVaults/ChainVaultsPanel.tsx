import { css, cx } from '@repo/styles/css';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { type Components, type ListProps, Virtuoso } from 'react-virtuoso';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectChainByIdOrUndefined } from '../../../../../data/selectors/chains.ts';
import {
  selectSimplifiedChainIdsByTvl,
  selectSimplifiedVaultIdsByTvl,
} from '../../../../../data/selectors/simplified-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { Vault } from '../../../Vault/Vault.tsx';
import { useVaultListHeight } from './hooks.ts';

export type ChainVaultsPanelProps = {
  assetKey: string;
};

/**
 * Step 2 (which chain) and step 3 (which vault) share one panel with a fixed height, so switching
 * chains never moves the rows below it.
 */
export const ChainVaultsPanel = memo(function ChainVaultsPanel({
  assetKey,
}: ChainVaultsPanelProps) {
  const chainIds = useAppSelector(state => selectSimplifiedChainIdsByTvl(state, assetKey));
  const [selectedChainId, setSelectedChainId] = useState<ChainEntity['id'] | undefined>(
    chainIds[0]
  );

  // the richest chain is preselected; re-point if the chain list changes under us
  useEffect(() => {
    if (chainIds.length && (!selectedChainId || !chainIds.includes(selectedChainId))) {
      setSelectedChainId(chainIds[0]);
    }
  }, [chainIds, selectedChainId]);

  const listHeight = useVaultListHeight();

  if (!chainIds.length) {
    return null;
  }

  return (
    <div className={panelCss}>
      <div className={stepsScrollCss}>
        <div className={stepsCss}>
          {chainIds.map(chainId => (
            <ChainStep
              key={chainId}
              assetKey={assetKey}
              chainId={chainId}
              selected={chainId === selectedChainId}
              onSelect={setSelectedChainId}
            />
          ))}
        </div>
      </div>
      <div className={listCss} style={{ height: listHeight }}>
        {selectedChainId ?
          <VaultList assetKey={assetKey} chainId={selectedChainId} height={listHeight} />
        : null}
      </div>
    </div>
  );
});

type ChainStepProps = {
  assetKey: string;
  chainId: ChainEntity['id'];
  selected: boolean;
  onSelect: (chainId: ChainEntity['id']) => void;
};

const ChainStep = memo(function ChainStep({
  assetKey,
  chainId,
  selected,
  onSelect,
}: ChainStepProps) {
  const chain = useAppSelector(state => selectChainByIdOrUndefined(state, chainId));
  const vaultIds = useAppSelector(state => selectSimplifiedVaultIdsByTvl(state, assetKey, chainId));
  const handleClick = useCallback(() => onSelect(chainId), [onSelect, chainId]);

  return (
    <button
      type="button"
      className={cx(stepCss, selected ? stepSelectedCss : undefined)}
      onClick={handleClick}
      aria-pressed={selected}
    >
      <ChainIcon chainId={chainId} size={20} />
      <span>{chain?.name || chainId}</span>
      <span className={stepCountCss}>{vaultIds.length}</span>
    </button>
  );
});

function itemRenderer(_index: number, vaultId: VaultEntity['id']) {
  return <Vault vaultId={vaultId} />;
}

function itemKey(_index: number, vaultId: VaultEntity['id']) {
  return vaultId;
}

const VaultList = memo(function VaultList({
  assetKey,
  chainId,
  height,
}: {
  assetKey: string;
  chainId: ChainEntity['id'];
  height: number;
}) {
  const vaultIds = useAppSelector(state => selectSimplifiedVaultIdsByTvl(state, assetKey, chainId));

  return (
    <Virtuoso
      data={vaultIds}
      itemContent={itemRenderer}
      computeItemKey={itemKey}
      style={{ height }}
      components={virtuosoComponents}
    />
  );
});

const VaultsListHolder = forwardRef<HTMLDivElement, ListProps>(function VaultsListHolder(
  { style, children },
  ref
) {
  return (
    <div ref={ref} style={style} className={vaultsCss}>
      {children}
    </div>
  );
});

const virtuosoComponents: Components<VaultEntity['id']> = { List: VaultsListHolder };

const panelCss = css({
  display: 'grid',
  // the steps strip is width:max-content; without an explicit minmax(0,...) column it would size
  // the implicit track to its full width and overflow the page container
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: 'auto 1fr',
  background: 'background.content.dark',
});

const stepsScrollCss = css({
  minWidth: 0,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const stepsCss = css({
  display: 'flex',
  gap: '8px',
  padding: '12px 24px',
  width: 'max-content',
  minWidth: '100%',
});

// mirrors the `filter` button palette (panda.config.ts) so the steps read as the same control family
const stepCss = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
  padding: '6px 12px',
  borderRadius: '8px',
  textStyle: 'body.sm.medium',
  color: 'text.dark',
  background: 'background.content',
  border: 'solid 2px {colors.background.content}',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  _hover: {
    color: 'text.middle',
  },
});

const stepSelectedCss = css({
  color: 'text.light',
  background: 'background.button',
  borderColor: 'background.button',
});

const stepCountCss = css({
  textStyle: 'subline.sm',
  color: 'inherit',
  opacity: '0.7',
});

const listCss = css({
  overflow: 'hidden',
});

const vaultsCss = css({
  display: 'grid',
  gap: '2px',
  background: 'background.content.dark',
});
