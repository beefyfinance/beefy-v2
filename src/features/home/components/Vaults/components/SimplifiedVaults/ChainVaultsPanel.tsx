import { css, cx } from '@repo/styles/css';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Components, type ListProps, Virtuoso } from 'react-virtuoso';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectChainByIdOrUndefined } from '../../../../../data/selectors/chains.ts';
import {
  selectSimplifiedAllVaultIdsByTvl,
  selectSimplifiedChainIdsByTvl,
  selectSimplifiedVaultIdsByTvl,
} from '../../../../../data/selectors/simplified-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { Vault } from '../../../Vault/Vault.tsx';
import { useVaultListHeight } from './hooks.ts';

/** sentinel for the "All" step, which is not a chain */
const ALL_CHAINS = 'all';
const EMPTY_IDS: readonly string[] = Object.freeze([]);
type StepValue = ChainEntity['id'] | typeof ALL_CHAINS;

export type ChainVaultsPanelProps = {
  assetKey: string;
};

/**
 * Step 2 (which chain) and step 3 (which vault) are one panel. The list is sized to the vaults it
 * actually holds, up to 3 rows, so a one-vault chain leaves no dead space below it.
 */
export const ChainVaultsPanel = memo(function ChainVaultsPanel({
  assetKey,
}: ChainVaultsPanelProps) {
  const chainIds = useAppSelector(state => selectSimplifiedChainIdsByTvl(state, assetKey));
  const [selected, setSelected] = useState<StepValue>(ALL_CHAINS);

  // a chain can disappear under a filter change while it is the active step
  useEffect(() => {
    setSelected(current =>
      current === ALL_CHAINS || chainIds.includes(current) ? current : ALL_CHAINS
    );
  }, [chainIds]);

  const allVaultIds = useAppSelector(state => selectSimplifiedAllVaultIdsByTvl(state, assetKey));
  const chainVaultIds = useAppSelector(state =>
    selected === ALL_CHAINS ?
      (EMPTY_IDS as VaultEntity['id'][])
    : selectSimplifiedVaultIdsByTvl(state, assetKey, selected)
  );
  const vaultIds = selected === ALL_CHAINS ? allVaultIds : chainVaultIds;
  const listHeight = useVaultListHeight(Math.min(vaultIds.length, 3));

  // one chain means the step row is just a label for the only option
  const showSteps = chainIds.length > 1;

  if (!vaultIds.length) {
    return null;
  }

  return (
    <div className={panelCss}>
      {showSteps ?
        <div className={stepsScrollCss}>
          <div className={stepsCss}>
            <AllStep
              count={allVaultIds.length}
              selected={selected === ALL_CHAINS}
              onSelect={setSelected}
            />
            {chainIds.map(chainId => (
              <ChainStep
                key={chainId}
                assetKey={assetKey}
                chainId={chainId}
                selected={chainId === selected}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>
      : null}
      <div className={listCss} style={{ height: listHeight }}>
        <VaultList vaultIds={vaultIds} height={listHeight} />
      </div>
    </div>
  );
});

type AllStepProps = {
  count: number;
  selected: boolean;
  onSelect: (value: StepValue) => void;
};

const AllStep = memo(function AllStep({ count, selected, onSelect }: AllStepProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onSelect(ALL_CHAINS), [onSelect]);

  return (
    <button
      type="button"
      className={cx(stepCss, selected ? stepSelectedCss : undefined)}
      onClick={handleClick}
      aria-pressed={selected}
    >
      <span>{t('Simplified-AllChains')}</span>
      <span className={stepCountCss}>{count}</span>
    </button>
  );
});

type ChainStepProps = {
  assetKey: string;
  chainId: ChainEntity['id'];
  selected: boolean;
  onSelect: (value: StepValue) => void;
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
  const name = chain?.name || chainId;

  return (
    <button
      type="button"
      className={cx(stepCss, selected ? stepSelectedCss : undefined)}
      onClick={handleClick}
      aria-pressed={selected}
      // the logo carries the identity; the name stays for screen readers and native tooltips
      aria-label={name}
      title={name}
    >
      <ChainIcon chainId={chainId} size={20} />
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
  vaultIds,
  height,
}: {
  vaultIds: VaultEntity['id'][];
  height: number;
}) {
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
