import { memo, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../store';
import { Banner } from '../Banner';
import { Trans, useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import {
  isCowcentratedGovVault,
  type VaultEntity,
  type VaultGovCowcentrated,
  type VaultStandardCowcentrated,
} from '../../../features/data/entities/vault';
import { InternalLink } from '../Links/Links';
import { selectVaultById } from '../../../features/data/selectors/vaults';
import { selectHasUserDepositInVault } from '../../../features/data/selectors/balance';

export type ClmVaultBannerProps = {
  vaultId: VaultEntity['id'];
};

export const ClmVaultBanner = memo<ClmVaultBannerProps>(function ClmVaultBanner({ vaultId }) {
  const maybeClmPool = useAppSelector(state => selectVaultById(state, vaultId));
  const [hideBanner, setHideBanner] = useLocalStorageBoolean(
    `hideClmVaultBanner.${maybeClmPool.id}`,
    false
  );
  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (!hideBanner && isCowcentratedGovVault(maybeClmPool) && maybeClmPool.cowcentratedIds.vault) {
    return (
      <ClmVaultBannerImpl
        pool={maybeClmPool}
        vaultId={maybeClmPool.cowcentratedIds.vault}
        onClose={closeBanner}
      />
    );
  }

  return null;
});

export type ClmVaultBannerImplProps = {
  pool: VaultGovCowcentrated;
  vaultId: VaultStandardCowcentrated['id'];
  onClose: () => void;
};

const ClmVaultBannerImpl = memo<ClmVaultBannerImplProps>(function ClmVaultBannerImpl({
  pool,
  vaultId,
  onClose,
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
    <Banner
      icon={<img src={clmIcon} alt="" width={24} height={24} />}
      text={
        <Trans
          t={t}
          i18nKey={`Banner-ClmVault${isDeposited ? '-Deposited' : ''}`}
          components={components}
        />
      }
      onClose={onClose}
    />
  );
});
