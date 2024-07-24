import { memo, useCallback, useMemo } from 'react';
import {
  selectUserIsUnstakedForVaultId,
  selectUserUnstakedCowcentratedGovVaultIds,
} from '../../../features/data/selectors/balance';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Banner } from '../Banner';
import { Trans, useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { isCowcentratedGovVault, type VaultEntity } from '../../../features/data/entities/vault';
import { ButtonLink, InternalLink } from '../Links/Links';
import { filteredVaultsActions } from '../../../features/data/reducers/filtered-vaults';
import { selectDepositTokenByVaultId } from '../../../features/data/selectors/tokens';
import { Container, makeStyles } from '@material-ui/core';
import type { Theme } from '@material-ui/core';
import {
  selectCLMHasPoolOrVaultOrBoth,
  selectVaultById,
} from '../../../features/data/selectors/vaults';

const useStyles = makeStyles((theme: Theme) => ({
  clmUnstakedBannerContainer: {
    backgroundColor: theme.palette.background.footerHeader,
  },
}));

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
    const clmVariations = useAppSelector(state => selectCLMHasPoolOrVaultOrBoth(state, vaultId));
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const isGov = isCowcentratedGovVault(vault);
    const [hideBanner, setHideBanner] = useLocalStorageBoolean(
      `hideUnstakedClmBanner.${vaultId}`,
      false
    );
    const closeBanner = useCallback(() => {
      setHideBanner(true);
    }, [setHideBanner]);

    const endOfKey = !fromVault
      ? clmVariations?.pool && clmVariations?.vault
        ? 'link-both'
        : 'link'
      : `this-${isGov ? 'gov' : 'vault'}`;

    const typeWithLink = endOfKey.includes('link')
      ? clmVariations?.pool && !clmVariations?.vault
        ? 'CLM Pool'
        : clmVariations?.vault && !clmVariations?.pool
        ? 'Vault'
        : ''
      : '';

    const components = useMemo(() => {
      if (clmVariations?.pool && clmVariations?.vault) {
        return {
          Link: <InternalLink to={`/vault/${clmVariations.pool}`} />,
          Link2: <InternalLink to={`/vault/${clmVariations.vault}`} />,
        };
      }

      if (clmVariations?.pool && !clmVariations?.vault) {
        return { Link: <InternalLink to={`/vault/${clmVariations.pool}`} />, Link2: <span /> };
      }

      if (clmVariations?.vault && !clmVariations?.pool) {
        return { Link: <InternalLink to={`/vault/${clmVariations.vault}`} />, Link2: <span /> };
      }

      //null checks
      return { Link: <span />, Link2: <span /> };
    }, [clmVariations?.pool, clmVariations?.vault]);

    if (hideBanner || !shouldStake) {
      return null;
    }

    return (
      <Banner
        icon={<img src={clmIcon} alt="" width={24} height={24} />}
        text={
          <Trans
            t={t}
            i18nKey={`Banner-UnstakedClm-${endOfKey}`}
            values={{ token: depositToken.symbol, type: typeWithLink }}
            components={components}
          />
        }
        onClose={closeBanner}
      />
    );
  }
);

interface UnstakedClmBannerDashboardProps {
  address: string;
}

export const UnstakedClmBannerDashboard = memo<UnstakedClmBannerDashboardProps>(
  function UnstakedClmBannerDashboard({ address }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const unstakedIds = useAppSelector(state =>
      selectUserUnstakedCowcentratedGovVaultIds(state, address)
    );
    const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideUnstakedClmBanner', false);
    const closeBanner = useCallback(() => {
      setHideBanner(true);
    }, [setHideBanner]);

    if (hideBanner || !unstakedIds.length) {
      return null;
    }

    if (unstakedIds.length === 1) {
      return (
        <div className={classes.clmUnstakedBannerContainer}>
          <Container maxWidth="lg">
            <UnstakedClmBannerVault vaultId={unstakedIds[0]} />
          </Container>
        </div>
      );
    }

    return (
      <div className={classes.clmUnstakedBannerContainer}>
        <Container maxWidth="lg">
          <Banner
            icon={<img src={clmIcon} alt="" />}
            text={
              <Trans
                t={t}
                i18nKey={`Banner-UnstakedClm`}
                values={{ count: unstakedIds.length }}
                components={{
                  Link: <span />,
                }}
              />
            }
            onClose={closeBanner}
          />
        </Container>
      </div>
    );
  }
);
