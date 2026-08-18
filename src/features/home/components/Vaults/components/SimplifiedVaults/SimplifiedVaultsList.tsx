import { css } from '@repo/styles/css';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectFilterSearchText } from '../../../../../data/selectors/filtered-vaults.ts';
import {
  SIMPLIFIED_ASSET_LIMIT,
  selectSimplifiedAssetKeysByTvl,
} from '../../../../../data/selectors/simplified-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { AssetRow } from './AssetRow.tsx';

export const SimplifiedVaultsList = memo(function SimplifiedVaultsList() {
  const { t } = useTranslation();
  const assetKeys = useAppSelector(selectSimplifiedAssetKeysByTvl);
  const searchText = useAppSelector(selectFilterSearchText);
  const [openAssetKey, setOpenAssetKey] = useState<string | undefined>(undefined);

  // unsearched the list is a shortlist of the richest assets; search reaches all of them
  const visibleKeys = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return needle ?
        assetKeys.filter(key => key.toLowerCase().includes(needle))
      : assetKeys.slice(0, SIMPLIFIED_ASSET_LIMIT);
  }, [assetKeys, searchText]);

  const handleToggle = useCallback(
    (assetKey: string) => setOpenAssetKey(current => (current === assetKey ? undefined : assetKey)),
    []
  );

  if (!visibleKeys.length) {
    return <div className={emptyCss}>{t('Simplified-NoAssets')}</div>;
  }

  return (
    <div className={listCss}>
      {visibleKeys.map(assetKey => (
        <AssetRow
          key={assetKey}
          assetKey={assetKey}
          open={openAssetKey === assetKey}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
});

const listCss = css({
  display: 'grid',
  gap: '2px',
  background: 'background.content.dark',
  borderTop: 'solid 2px {colors.background.content.dark}',
});

const emptyCss = css({
  padding: '32px 24px',
  textAlign: 'center',
  textStyle: 'body',
  color: 'text.dark',
  background: 'background.content',
});
