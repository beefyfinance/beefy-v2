import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  isCowcentratedGovVault,
  type VaultEntity,
  type VaultGovCowcentrated,
  type VaultStandardCowcentrated,
} from '../../../features/data/entities/vault.ts';
import { selectHasUserDepositInVault } from '../../../features/data/selectors/balance.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import clmIcon from '../../../images/icons/clm.svg';
import { DismissibleBanner } from '../Banner/DismissibleBanner.tsx';
import { InternalLink } from '../Links/InternalLink.tsx';

export type ClmVaultBannerProps = {
  vaultId: VaultEntity['id'];
};

export const ClmVaultBanner = memo<ClmVaultBannerProps>(function ClmVaultBanner({ vaultId }) {
  const maybeClmPool = useAppSelector(state => selectVaultById(state, vaultId));

  if (!isCowcentratedGovVault(maybeClmPool) || !maybeClmPool.cowcentratedIds.vault) {
    return null;
  }

  return <ClmVaultBannerImpl pool={maybeClmPool} vaultId={maybeClmPool.cowcentratedIds.vault} />;
});

export type ClmVaultBannerImplProps = {
  pool: VaultGovCowcentrated;
  vaultId: VaultStandardCowcentrated['id'];
};

const ClmVaultBannerImpl = memo<ClmVaultBannerImplProps>(function ClmVaultBannerImpl({
  pool,
  vaultId,
}) {
  const { t } = useTranslation();
  const isDeposited = useAppSelector(state => selectHasUserDepositInVault(state, pool.id));
  const components = useMemo(
    () => ({
      VaultLink: <InternalLink to={`/vault/${vaultId}`} />,
    }),
    [vaultId]
  );

  return (
    <DismissibleBanner
      id={`clm-vault.${pool.id}`}
      icon={<img src={clmIcon} alt="" width={24} height={24} />}
      text={
        <Trans
          t={t}
          i18nKey={`Banner-ClmVault${isDeposited ? '-Deposited' : ''}`}
          components={components}
        />
      }
    />
  );
});
