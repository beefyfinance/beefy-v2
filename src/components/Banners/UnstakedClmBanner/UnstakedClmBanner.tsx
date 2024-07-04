import { memo, useCallback } from 'react';
import {
  selectUserIsUnstakedForVaultId,
  selectUserUnstakedCowcentratedGovVaultIds,
} from '../../../features/data/selectors/balance';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Banner } from '../Banner';
import { Trans, useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import type { VaultEntity } from '../../../features/data/entities/vault';
import { ButtonLink, InternalLink } from '../Links/Links';
import { filteredVaultsActions } from '../../../features/data/reducers/filtered-vaults';
import { selectDepositTokenByVaultId } from '../../../features/data/selectors/tokens';

export const UnstakedClmBanner = memo(function UnstakedClmBanner() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const unstakedIds = useAppSelector(selectUserUnstakedCowcentratedGovVaultIds);
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
  fromVault?: boolean;
};

export const UnstakedClmBannerVault = memo<UnstakedClmBannerVaultProps>(
  function UnstakedClmBannerVault({ vaultId, fromVault }) {
    const { t } = useTranslation();
    const shouldStake = useAppSelector(state => selectUserIsUnstakedForVaultId(state, vaultId));
    const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
    const [hideBanner, setHideBanner] = useLocalStorageBoolean(
      `hideUnstakedClmBanner.${vaultId}`,
      false
    );
    const closeBanner = useCallback(() => {
      setHideBanner(true);
    }, [setHideBanner]);

    if (hideBanner || !shouldStake) {
      return null;
    }

    return (
      <Banner
        icon={<img src={clmIcon} alt="" width={24} height={24} />}
        text={
          <Trans
            t={t}
            i18nKey={`Banner-UnstakedClm-${!fromVault ? 'link' : 'this'}`}
            values={{ token: depositToken.symbol }}
            components={{
              Link: <InternalLink to={`/vault/${vaultId}`} />,
            }}
          />
        }
        onClose={closeBanner}
      />
    );
  }
);
