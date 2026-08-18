import { memo } from 'react';
import { VaultsSearch } from '../VaultsSearch/VaultsSearch.tsx';
import { VaultsSort } from '../VaultsSort/VaultsSort.tsx';
import { ViewModeFilter } from '../ViewModeFilter/ViewModeFilter.tsx';
import { selectVaultsViewMode } from '../../../../../data/selectors/vaults-list.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { css, cx } from '@repo/styles/css';

export const VaultsHeader = memo(function VaultsHeader() {
  const viewMode = useAppSelector(selectVaultsViewMode);
  const isSimplified = viewMode === 'simplified';

  return (
    <div className={cx(headerCss, isSimplified ? simplifiedHeaderCss : undefined)}>
      <div className={searchRowCss}>
        <VaultsSearch />
        <ViewModeFilter />
      </div>
      {isSimplified ? null : <VaultsSort />}
    </div>
  );
});

// column geometry must stay identical to Vault/styles.ts vaultInner, or the sort headers stop
// lining up with the stat columns in the rows below
const headerCss = css({
  display: 'grid',
  columnGap: '24px',
  rowGap: '12px',
  width: '100%',
  color: 'text.dark',
  background: 'background.content.dark',
  padding: '16px 24px',
  gridTemplateColumns: '1fr',
  alignItems: 'center',
  backgroundClip: 'padding-box',
  sm: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    rowGap: '16px',
  },
  lg: {
    gridTemplateColumns: 'minmax(0, 50fr) minmax(0, 50fr)',
    position: 'sticky',
    top: 0,
    zIndex: '[1]',
  },
});

/** no sort column in simplified mode, so the search row spans the full width */
const simplifiedHeaderCss = css({
  lg: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
});

const searchRowCss = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '12px',
  // the search input caps itself at 75% for the old full-width cell; the toggle now takes that slack
  '& > *:first-child': {
    lg: {
      maxWidth: '100%',
    },
  },
});
