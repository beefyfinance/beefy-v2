import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  memo,
  type Ref,
  useMemo,
} from 'react';
import { Vault } from '../../../Vault/Vault.tsx';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { Virtuoso } from 'react-virtuoso';
import { css } from '@repo/styles/css';
import { useBreakpoints } from '../../../../../../components/MediaQueries/useBreakpoints.ts';

function useVaultHeightEstimate() {
  const breakpoints = useBreakpoints();
  if (breakpoints.lg) {
    // 100 = most normal vaults
    // 124 = two line title
    return 100;
  }

  if (breakpoints.md) {
    // 171 = last normal vault
    // 191 = boosted vault
    return 173;
  }

  if (breakpoints.sm) {
    // 242 = last normal vault
    // 280 = boosted vault
    return 244;
  }

  // at 375w
  // 310 = last normal vault
  // 336 = two line title
  return 312;
}

function itemRenderer(_index: number, vaultId: VaultEntity['id']) {
  return <Vault vaultId={vaultId} />;
}

function itemKey(_index: number, vaultId: VaultEntity['id']) {
  return vaultId;
}

const StyledList = memo(
  forwardRef(function (
    props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    ref: Ref<HTMLDivElement>
  ) {
    return <div ref={ref} {...props} className={listClass} />;
  })
);

const components = {
  List: StyledList,
};

type VirtualVaultsListProps = {
  vaultIds: VaultEntity['id'][];
};

export const VirtualVaultsList = memo(function VirtualVaultsList({
  vaultIds,
}: VirtualVaultsListProps) {
  const defaultItemHeight = useVaultHeightEstimate();
  const increaseViewportBy = useMemo(
    () => ({ top: defaultItemHeight * 2, bottom: defaultItemHeight * 4 }),
    [defaultItemHeight]
  );

  return (
    <Virtuoso
      data={vaultIds}
      itemContent={itemRenderer}
      computeItemKey={itemKey}
      defaultItemHeight={defaultItemHeight}
      increaseViewportBy={increaseViewportBy}
      useWindowScroll={true}
      components={components}
    />
  );
});

const listClass = css({
  display: 'grid',
  gridTemplateColumns: '100%',
  width: '100%',
  gap: '2px',
  background: 'background.content.dark',
  borderRadius: '8px',
  overflow: 'hidden',
});
