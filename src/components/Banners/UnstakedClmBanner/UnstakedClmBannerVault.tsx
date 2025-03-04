import { memo, useMemo } from 'react';
import type { UnstakedClmBannerVaultImplProps, UnstakedClmBannerVaultProps } from './types.ts';
import { useAppSelector } from '../../../store.ts';
import { selectUserIsUnstakedForVaultId } from '../../../features/data/selectors/balance.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
} from '../../../features/data/entities/vault.ts';
import { ClmVaultBanner } from '../ClmVaultBanner/ClmVaultBanner.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { selectTokenByAddress } from '../../../features/data/selectors/tokens.ts';
import { InternalLink } from '../Links/InternalLink.tsx';
import { ClmBanner } from './ClmBanner.tsx';

export const UnstakedClmBannerVault = memo<UnstakedClmBannerVaultProps>(
  function UnstakedClmBannerVault({ vaultId, fromVault }) {
    const shouldStake = useAppSelector(state => selectUserIsUnstakedForVaultId(state, vaultId));
    const vault = useAppSelector(state => selectVaultById(state, vaultId));

    if (!isCowcentratedLikeVault(vault)) {
      return null;
    }

    if (shouldStake) {
      return <UnstakedClmBannerVaultImpl vault={vault} fromVault={fromVault || false} />;
    }

    if (fromVault) {
      return <ClmVaultBanner vaultId={vaultId} />;
    }

    return null;
  }
);

const UnstakedClmBannerVaultImpl = memo<UnstakedClmBannerVaultImplProps>(
  function UnstakedClmBannerVaultImpl({ vault, fromVault }) {
    const { t } = useTranslation();
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(
        state,
        vault.chainId,
        isCowcentratedVault(vault) ? vault.contractAddress : vault.depositTokenAddress
      )
    );
    const availableTypes =
      vault.cowcentratedIds.pool && vault.cowcentratedIds.vault
        ? 'both'
        : vault.cowcentratedIds.pool
          ? 'gov'
          : 'standard';
    const thisType = vault.type;
    const endOfKey = !fromVault
      ? `link-${availableTypes}`
      : `this-${thisType}${availableTypes === 'both' ? '-both' : ''}`;

    const components = useMemo(() => {
      return {
        GovLink: vault.cowcentratedIds.pool ? (
          <InternalLink to={`/vault/${vault.cowcentratedIds.pool}`} />
        ) : (
          <span />
        ),
        VaultLink: vault.cowcentratedIds.vault ? (
          <InternalLink to={`/vault/${vault.cowcentratedIds.vault}`} />
        ) : (
          <span />
        ),
      };
    }, [vault.cowcentratedIds.pool, vault.cowcentratedIds.vault]);

    return (
      <ClmBanner
        text={
          <Trans
            t={t}
            i18nKey={`Banner-UnstakedClm-${endOfKey}`}
            values={{ token: depositToken.symbol }}
            components={components}
          />
        }
      />
    );
  }
);
