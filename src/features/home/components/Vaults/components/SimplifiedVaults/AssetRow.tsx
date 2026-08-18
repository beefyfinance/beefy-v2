import { css } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import {
  STABLES_ASSET_KEY,
  selectSimplifiedAssetTvl,
  selectSimplifiedAssetVaultCount,
  selectSimplifiedChainIdsByTvl,
} from '../../../../../data/selectors/simplified-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { ChainVaultsPanel } from './ChainVaultsPanel.tsx';
import { Chevron } from './Chevron.tsx';

export type AssetRowProps = {
  assetKey: string;
  open: boolean;
  onToggle: (assetKey: string) => void;
};

const STABLE_ICONS = ['USDC', 'USDT', 'DAI'];

export const AssetRow = memo(function AssetRow({ assetKey, open, onToggle }: AssetRowProps) {
  const { t } = useTranslation();
  // the Stables bucket is synthetic, so it borrows a representative cluster of stablecoin icons
  const symbols = useMemo(
    () => (assetKey === STABLES_ASSET_KEY ? STABLE_ICONS : [assetKey]),
    [assetKey]
  );
  const label = assetKey === STABLES_ASSET_KEY ? t('Simplified-Stables') : assetKey;
  const tvl = useAppSelector(state => selectSimplifiedAssetTvl(state, assetKey));
  const vaultCount = useAppSelector(state => selectSimplifiedAssetVaultCount(state, assetKey));
  const chainIds = useAppSelector(state => selectSimplifiedChainIdsByTvl(state, assetKey));
  const chainCount = chainIds.length;
  // icons resolve as `<chainId>/<symbol>` before falling back to `<symbol>`, so the richest chain
  // is what makes chain-specific art (robinhood/GME.png) load
  const iconChainId = chainIds[0];
  const handleClick = useCallback(() => onToggle(assetKey), [onToggle, assetKey]);

  return (
    <div className={containerCss}>
      <button type="button" className={headerCss} onClick={handleClick} aria-expanded={open}>
        <AssetsImage assetSymbols={symbols} chainId={iconChainId} size={32} />
        <span className={symbolCss}>{label}</span>
        <span className={countCss}>
          {t('Simplified-VaultCount', { count: vaultCount })} ·{' '}
          {t('Simplified-ChainCount', { count: chainCount })}
        </span>
        <span className={tvlCss}>{formatLargeUsd(tvl)}</span>
        <Chevron open={open} />
      </button>
      {open ?
        <ChainVaultsPanel assetKey={assetKey} />
      : null}
    </div>
  );
});

const containerCss = css({
  display: 'grid',
});

const headerCss = css({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto auto auto',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '16px 24px',
  background: 'background.content',
  textAlign: 'left',
  cursor: 'pointer',
  _hover: {
    background: 'background.content.light',
  },
});

const symbolCss = css({
  textStyle: 'body.medium',
  color: 'text.light',
});

const countCss = css({
  textStyle: 'subline.sm',
  color: 'text.dark',
});

const tvlCss = css({
  textStyle: 'body.medium',
  color: 'text.middle',
});
