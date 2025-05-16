import { orderBy } from 'lodash-es';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../features/data/entities/chain.ts';
import {
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../../../features/data/entities/vault.ts';
import { selectVaultTotalApy } from '../../../features/data/selectors/apy.ts';
import {
  selectConcentratedLiquidityManagerPlatforms,
  selectPlatformById,
} from '../../../features/data/selectors/platforms.ts';
import {
  selectChainWrappedNativeToken,
  selectTokenByIdOrUndefined,
} from '../../../features/data/selectors/tokens.ts';
import { selectVaultTvl } from '../../../features/data/selectors/tvl.ts';
import {
  selectAllCowcentratedVaultsByChainId,
  selectVaultById,
} from '../../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../../features/data/store/types.ts';
import { isDefined } from '../../../features/data/utils/array-utils.ts';
import { formatLargePercent } from '../../../helpers/format.ts';
import { getIcon } from '../../../helpers/iconSrc.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { ListJoin } from '../../ListJoin.tsx';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { InternalLink } from '../Links/InternalLink.tsx';

type RetiredSuggestClmBannerProps = {
  vaultId: VaultEntity['id'];
};

function selectNormalizeAsset(state: BeefyState, chainId: ChainEntity['id'], assetId: string) {
  let token = selectTokenByIdOrUndefined(state, chainId, assetId);
  if (!token) {
    return assetId.toLowerCase().replace(/^w/, '');
  }

  if (token.type === 'native') {
    token = selectChainWrappedNativeToken(state, chainId);
  }

  return token.symbol.toLowerCase();
}

function selectNormalizeAssets(state: BeefyState, chainId: ChainEntity['id'], assetIds: string[]) {
  return assetIds.map(id => selectNormalizeAsset(state, chainId, id)).sort();
}

function selectAreAssetsEqual(
  state: BeefyState,
  vaultSymbols: string[],
  otherChainId: ChainEntity['id'],
  otherAssetIds: string[]
) {
  if (vaultSymbols.length !== otherAssetIds.length) {
    return false;
  }
  const otherSymbols = selectNormalizeAssets(state, otherChainId, otherAssetIds);
  return otherSymbols.every((id, i) => id === vaultSymbols[i]);
}

function selectClmsWithAssetsMatchingVault(state: BeefyState, vaultId: VaultEntity['id']) {
  const vault = selectVaultById(state, vaultId);
  const clmPlatforms = selectConcentratedLiquidityManagerPlatforms(state);

  if (
    vault.status !== 'eol' ||
    vault.assetIds?.length !== 2 ||
    (!isCowcentratedLikeVault(vault) && !clmPlatforms.includes(vault.platformId))
  ) {
    return undefined;
  }

  const clms = selectAllCowcentratedVaultsByChainId(state, vault.chainId);
  if (clms.length === 0) {
    return undefined;
  }

  const vaultSymbols = selectNormalizeAssets(state, vault.chainId, vault.assetIds);
  const withSameAssets = clms.filter(
    clm =>
      clm.id !== vault.id &&
      clm.chainId === vault.chainId &&
      clm.status === 'active' &&
      selectAreAssetsEqual(state, vaultSymbols, clm.chainId, clm.assetIds)
  );
  if (!withSameAssets.length) {
    return undefined;
  }

  // only vaults if there is any
  let type: 'vault' | 'pool' = 'vault';
  let ids = withSameAssets.map(clm => clm.cowcentratedIds.vault).filter(isDefined);

  // otherwise pools
  if (!ids.length) {
    type = 'pool';
    ids = withSameAssets.map(clm => clm.cowcentratedIds.pool).filter(isDefined);
  }

  if (!ids.length) {
    return undefined;
  }

  return {
    ids: orderBy(ids, id => selectVaultTvl(state, id).toNumber(), 'desc'),
    type,
  };
}

const VaultLink = memo(function VaultLink({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const apy = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const apyLabel = apy.totalType.toUpperCase();

  return (
    <Trans
      t={t}
      i18nKey="Banner-RetiredSuggestClm-Link"
      values={{
        name: vault.names.short,
        platform: (platform && platform.name) || vault.platformId,
        apy: `${formatLargePercent(apy.boostedTotalApy || apy.totalApy)} ${apyLabel}`,
      }}
      components={{
        Link: <InternalLink to={`/vault/${vault.id}`} />,
      }}
    />
  );
});

export const RetiredSuggestClmBanner = memo(function RetiredSuggestClmBanner({
  vaultId,
}: RetiredSuggestClmBannerProps) {
  const { t } = useTranslation();
  const matching = useAppSelector(state => selectClmsWithAssetsMatchingVault(state, vaultId));
  const components = useMemo(
    () =>
      matching && {
        Links: (
          <ListJoin
            mode="or"
            items={matching.ids.map(matchingId => (
              <VaultLink key={matchingId} vaultId={matchingId} />
            ))}
          />
        ),
      },
    [matching]
  );

  if (!matching) {
    return null;
  }

  return (
    <DismissibleBanner
      id={`retired-suggestions.${vaultId}`}
      icon={<img src={getIcon('clm')} alt="" aria-hidden={true} />}
      text={
        <Trans
          t={t}
          i18nKey={`Banner-RetiredSuggestClm-${matching.type}`}
          values={{ count: matching.ids.length }}
          components={components}
        />
      }
    />
  );
});
