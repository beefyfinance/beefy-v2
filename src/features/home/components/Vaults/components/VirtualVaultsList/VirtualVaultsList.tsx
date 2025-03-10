import { forwardRef, memo, type Ref, useMemo } from 'react';
import { Vault } from '../../../Vault/Vault.tsx';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  type Components,
  type FlatIndexLocationWithAlign,
  type ListProps,
  Virtuoso,
} from 'react-virtuoso';
import { css } from '@repo/styles/css';
import { useBreakpoints } from '../../../../../../components/MediaQueries/useBreakpoints.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { selectLastViewedVaultsVaultId } from '../../../../../data/selectors/vaults-list.ts';
import { useNavigationType } from 'react-router';

function useVaultHeightEstimate() {
  const breakpoints = useBreakpoints();
  if (breakpoints.lg) {
    // 100 = most normal vaults
    // 124 = two line title
    return 100;
  }

  if (breakpoints.md) {
    // 171 = normal vault
    // 191 = boosted vault
    return 171;
  }

  if (breakpoints.sm) {
    // 242 = normal vault
    // 280 = boosted vault
    return 242;
  }

  // at 375w
  // 306 = normal vault w/out underlying tvl and deposited $ value
  // 324 = normal vault w/ underlying tvl or deposited $ value
  // 344 = normal vault w/ underlying tvl and deposited $ value
  // +20px if boosted
  // +24px if two line title
  return 324;
}

function itemRenderer(_index: number, vaultId: VaultEntity['id']) {
  return <Vault vaultId={vaultId} />;
}

function itemKey(_index: number, vaultId: VaultEntity['id']) {
  return vaultId;
}

const StyledList = memo(
  forwardRef(function (props: ListProps, ref: Ref<HTMLDivElement>) {
    return <div ref={ref} {...props} className={listClass} />;
  })
);

const components: Components<string> = {
  List: StyledList,
};

type VirtualVaultsListProps = {
  vaultIds: VaultEntity['id'][];
};

export const VirtualVaultsList = memo(function VirtualVaultsList({
  vaultIds,
}: VirtualVaultsListProps) {
  const lastVaultId = useAppSelector(selectLastViewedVaultsVaultId);
  const navigationType = useNavigationType(); // Updated hook usage
  const defaultItemHeight = useVaultHeightEstimate();
  const increaseViewportBy = useMemo(
    () => ({ top: defaultItemHeight * 2, bottom: defaultItemHeight * 4 }),
    [defaultItemHeight]
  );
  const initialTopMostItemIndex = useMemo((): FlatIndexLocationWithAlign | undefined => {
    if (navigationType === 'POP' && lastVaultId !== undefined) {
      // Updated condition
      const index = vaultIds.indexOf(lastVaultId);
      return index === -1
        ? undefined
        : {
            index,
            align: 'center',
          };
    }
  }, [lastVaultId, vaultIds, navigationType]); // Updated dependency

  return (
    <Virtuoso
      data={vaultIds}
      itemContent={itemRenderer}
      computeItemKey={itemKey}
      defaultItemHeight={defaultItemHeight}
      increaseViewportBy={increaseViewportBy}
      useWindowScroll={true}
      components={components}
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
