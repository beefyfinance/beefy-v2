import { useTranslation } from 'react-i18next';
import { forwardRef, memo, type Ref, useMemo } from 'react';
import { Section } from '../../../../components/Section/Section.tsx';
import { Filter } from './components/Filter/Filter.tsx';
import { Vault } from './components/Vault/Vault.tsx';
import { useSortedDashboardVaults } from './hook.tsx';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { NoVaults } from './components/NoVaults/NoVaults.tsx';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { css } from '@repo/styles/css';
import {
  type Components,
  type ContextProp,
  type FlatIndexLocationWithAlign,
  type ListProps,
  Virtuoso,
} from 'react-virtuoso';
import { useAppSelector } from '../../../../store.ts';
import { selectLastViewedDashboardVaultId } from '../../../data/selectors/vaults-list.ts';
import { useHistory } from 'react-router-dom';

export type UserVaultsProps = {
  address: string;
};

export const UserVaults = memo(function UserVaults({ address }: UserVaultsProps) {
  const { t } = useTranslation();
  const { sortedFilteredVaults, sortedOptions, handleSort, searchText, setSearchText } =
    useSortedDashboardVaults(address);
  const mdDown = useBreakpoint({ to: 'sm' });
  const subTitle = mdDown
    ? 'Dashboard-Your-Vaults-Subtitle-Mobile'
    : 'Dashboard-Your-Vaults-Subtitle';

  return (
    <Section title={t('Dashboard-Your-Vaults-Title')} subTitle={t(subTitle)}>
      <div className={containerClass}>
        <Filter
          sortOptions={sortedOptions}
          handleSort={handleSort}
          handleSearchText={setSearchText}
          searchText={searchText}
        />
        {sortedFilteredVaults.length === 0 ? (
          <NoVaults />
        ) : (
          <VirtualList address={address} vaultIds={sortedFilteredVaults} />
        )}
      </div>
    </Section>
  );
});

const containerClass = css({
  borderRadius: '12px',
  border: 'solid 2px {colors.background.content.dark}',
  contain: 'paint',
});

type VirtualListProps = {
  vaultIds: VaultEntity['id'][];
  address: string;
};

type VirtualListContext = {
  address: string;
};

function itemRenderer(_index: number, vaultId: VaultEntity['id'], { address }: VirtualListContext) {
  return <Vault vaultId={vaultId} address={address} />;
}

function itemKey(_index: number, vaultId: VaultEntity['id']) {
  return vaultId;
}

const StyledList = memo(
  forwardRef(function (
    { context: _, ...props }: ListProps & ContextProp<VirtualListContext>,
    ref: Ref<HTMLDivElement>
  ) {
    return <div ref={ref} {...props} className={listClass} />;
  })
);

const components: Components<string, VirtualListContext> = {
  List: StyledList,
};

const increaseViewportBy = { top: 150, bottom: 150 };

export const VirtualList = memo(function VirtualList({ vaultIds, address }: VirtualListProps) {
  const context = useMemo(() => ({ address }), [address]);
  const lastVaultId = useAppSelector(selectLastViewedDashboardVaultId);
  const { action } = useHistory();
  const initialTopMostItemIndex = useMemo((): FlatIndexLocationWithAlign | undefined => {
    if (action === 'POP' && lastVaultId !== undefined) {
      const index = vaultIds.indexOf(lastVaultId);
      return index === -1
        ? undefined
        : {
            index,
            align: 'center',
          };
    }
  }, [lastVaultId, vaultIds, action]);

  return (
    <Virtuoso
      data={vaultIds}
      itemContent={itemRenderer}
      computeItemKey={itemKey}
      increaseViewportBy={increaseViewportBy}
      useWindowScroll={true}
      components={components}
      context={context}
      initialTopMostItemIndex={initialTopMostItemIndex}
    />
  );
});

const listClass = css({
  display: 'grid',
  gridTemplateColumns: '100%',
  width: '100%',
  gap: '2px',
  background: 'background.content.dark',
});
