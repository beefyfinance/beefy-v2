import { memo, useCallback, useMemo } from 'react';
import {
  selectUserShouldStakeForVault,
  selectUserUnstakedCowcentratedVaultIds,
} from '../../../features/data/selectors/balance';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Banner } from '../Banner';
import { Trans, useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import type { VaultEntity } from '../../../features/data/entities/vault';
import { ButtonLink, InternalLink } from '../Links/Links';
import { filteredVaultsActions } from '../../../features/data/reducers/filtered-vaults';

interface UnstakedClmBannerProps {
  className?: string;
}

export const UnstakedClmBanner = memo<UnstakedClmBannerProps>(function UnstakedClmBanner({
  className,
}) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const unstakedIds = useAppSelector(selectUserUnstakedCowcentratedVaultIds);
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideUnstakedClmBanner', false);
  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);
  const handleFilter = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
    dispatch(filteredVaultsActions.setUserCategory('deposited'));
    dispatch(
      filteredVaultsActions.setBoolean({
        filter: 'onlyUnstakedClm',
        value: true,
      })
    );
  }, [dispatch]);

  if (hideBanner || !unstakedIds.length) {
    return null;
  }

  if (unstakedIds.length === 1) {
    return <UnstakedClmBannerVault vaultId={unstakedIds[0]} />;
  }

  return (
    <Banner
      className={className}
      icon={<img src={clmIcon} alt="" />}
      text={
        <Trans
          t={t}
          i18nKey={`Banner-UnstakedClm`}
          values={{ count: unstakedIds.length }}
          components={{
            Link: <ButtonLink onClick={handleFilter} />,
          }}
        />
      }
      onClose={closeBanner}
    />
  );
});

export type UnstakedClmBannerVaultProps = {
  vaultId: VaultEntity['id'];
};

export const UnstakedClmBannerVault = memo<UnstakedClmBannerVaultProps>(
  function UnstakedClmBannerVault({ vaultId }) {
    const { t } = useTranslation();
    const shouldStake = useAppSelector(state => selectUserShouldStakeForVault(state, vaultId));
    const storageKey = useMemo(() => {
      if (shouldStake) {
        return `hideUnstakedClmBanner.${shouldStake.cowcentratedId}`;
      }
      return 'hideUnstakedClmBanner.vault';
    }, [shouldStake]);
    const [hideBanner, setHideBanner] = useLocalStorageBoolean(storageKey, false);
    const closeBanner = useCallback(() => {
      setHideBanner(true);
    }, [setHideBanner]);

    if (hideBanner || !shouldStake) {
      return null;
    }

    const withLink = vaultId !== shouldStake.id;

    return (
      <Banner
        icon={<img src={clmIcon} alt="" width={24} height={24} />}
        text={
          <Trans
            t={t}
            i18nKey={`Banner-UnstakedClm-${withLink ? 'link' : 'this'}-${shouldStake.type}`}
            components={{
              Link: <InternalLink to={`/vault/${shouldStake.id}`} />,
            }}
          />
        }
        onClose={closeBanner}
      />
    );
  }
);
