import { css } from '@repo/styles/css';
import { token } from '@repo/styles/tokens';
import { forwardRef, memo, type Ref, useMemo } from 'react';
import { NavigationType, useNavigationType } from 'react-router';
import {
  type Components,
  type FlatIndexLocationWithAlign,
  type ListProps,
  Virtuoso,
} from 'react-virtuoso';
import { useBreakpoints } from '../../../../../../components/MediaQueries/useBreakpoints.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectLastViewedVaultsVaultId } from '../../../../../data/selectors/vaults-list.ts';
import { Vault } from '../../../Vault/Vault.tsx';

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
  const initialTopMostItemIndex = useMemo((): FlatIndexLocationWithAlign | number => {
    if (navigationType === NavigationType.Pop && lastVaultId !== undefined) {
      // Updated condition
      const index = vaultIds.indexOf(lastVaultId);
      if (index >= 0) {
        return {
          index,
          align: 'center',
        };
      }
    }
    return 0;
  }, [lastVaultId, vaultIds, navigationType]); // Updated dependency

  const holderStyles = useMemo(
    () => ({
      backgroundSize: `100% ${defaultItemHeight}px`,
      backgroundImage: `linear-gradient(180deg, ${token('colors.background.vaults.standard')} 0px, ${token('colors.background.vaults.standard')} ${defaultItemHeight}px, ${token('colors.background.content.dark')} ${defaultItemHeight + 2}px, ${token('colors.background.content.dark')} ${defaultItemHeight + 2}px)`,
    }),
    [defaultItemHeight]
  );
  return (
    <div className={holderClass} style={holderStyles}>
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
    </div>
  );
});

const holderClass = css({
  backgroundImage:
    'linear-gradient(180deg, {colors.background.vaults.standard} 0%, {colors.background.vaults.standard} 98%, {colors.background.content.dark} 98%, {colors.background.content.dark} 100%)',
  backgroundSize: '100% 100px',
  backgroundRepeat: 'repeat-y',
});

const listClass = css({
  display: 'grid',
  gridTemplateColumns: '100%',
  width: '100%',
  gap: '2px',
  backgroundColor: 'background.content.dark',
});
