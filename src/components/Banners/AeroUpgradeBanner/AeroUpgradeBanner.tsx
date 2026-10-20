import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  isVaultAeroUpgrade,
  isVaultPaused,
  type VaultEntity,
} from '../../../features/data/entities/vault.ts';
import {
  selectHasUserDepositInVault,
  selectUserHasDepositInAeroUpgradeVault,
} from '../../../features/data/selectors/balance.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { ExternalLink } from '../../Links/ExternalLink.tsx';
import { Banner } from '../Banner/Banner.tsx';
import { baseClass } from '../Links/styles.ts';
import {
  BannerContainer,
  BannerWrapper,
} from '../UnstakedClmBanner/UnstakedClmBannerDashboard.tsx';

const components = { Link: <ExternalLink className={baseClass} /> };

const AeroUpgradeBanner = memo(function AeroUpgradeBanner() {
  const { t } = useTranslation();
  return (
    <Banner
      variant="warning"
      text={<Trans t={t} i18nKey="Banner-AeroUpgrade" components={components} />}
    />
  );
});

export const AeroUpgradeBannerHome = memo(function AeroUpgradeBannerHome() {
  const show = useAppSelector(selectUserHasDepositInAeroUpgradeVault);
  return show ? <AeroUpgradeBanner /> : null;
});

export const AeroUpgradeBannerVault = memo(function AeroUpgradeBannerVault({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // once paused, the deposit tab's pause reason takes over
  const show = useAppSelector(
    state =>
      isVaultAeroUpgrade(vault) &&
      !isVaultPaused(vault) &&
      selectHasUserDepositInVault(state, vaultId)
  );
  return show ? <AeroUpgradeBanner /> : null;
});

export const AeroUpgradeBannerDashboard = memo(function AeroUpgradeBannerDashboard({
  address,
}: {
  address: string;
}) {
  const show = useAppSelector(state => selectUserHasDepositInAeroUpgradeVault(state, address));
  return show ?
      <BannerWrapper>
        <BannerContainer maxWidth="lg">
          <AeroUpgradeBanner />
        </BannerContainer>
      </BannerWrapper>
    : null;
});
