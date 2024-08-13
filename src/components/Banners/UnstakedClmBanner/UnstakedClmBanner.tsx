import { memo, useCallback, useMemo } from 'react';
import {
  selectUserIsUnstakedForVaultId,
  selectUserUnstakedClms,
} from '../../../features/data/selectors/balance';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Banner, type BannerProps } from '../Banner';
import { Trans, useTranslation } from 'react-i18next';
import clmIcon from '../../../images/icons/clm.svg';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  type VaultCowcentratedLike,
  type VaultEntity,
} from '../../../features/data/entities/vault';
import { ButtonLink, InternalLink } from '../Links/Links';
import { filteredVaultsActions } from '../../../features/data/reducers/filtered-vaults';
import { selectTokenByAddress } from '../../../features/data/selectors/tokens';
import type { Theme } from '@material-ui/core';
import { Container, makeStyles } from '@material-ui/core';
import { selectVaultById } from '../../../features/data/selectors/vaults';
import { ClmVaultBanner } from '../ClmVaultBanner/ClmVaultBanner';
import { useHistory } from 'react-router-dom';

const variant: BannerProps['variant'] = 'warning';

const useStyles = makeStyles((theme: Theme) => ({
  clmUnstakedBannerContainer: {
    backgroundColor: theme.palette.background.footerHeader,
  },
}));

export const UnstakedClmBanner = memo(function UnstakedClmBanner() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { push } = useHistory();
  const unstakedIds = useAppSelector(selectUserUnstakedClms);
  const handleFilter = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
    dispatch(filteredVaultsActions.setUserCategory('deposited'));
    dispatch(
      filteredVaultsActions.setBoolean({
        filter: 'onlyUnstakedClm',
        value: true,
      })
    );
    push('/');
  }, [dispatch, push]);

  if (!unstakedIds.length) {
    return null;
  }

  if (unstakedIds.length === 1) {
    return <UnstakedClmBannerVault vaultId={unstakedIds[0]} />;
  }

  return (
    <Banner
      variant={variant}
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
    />
  );
});

export type UnstakedClmBannerVaultProps = {
  vaultId: VaultEntity['id'];
  fromVault?: boolean;
};

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

export type UnstakedClmBannerVaultImplProps = {
  vault: VaultCowcentratedLike;
  fromVault: boolean;
};

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
      vault.cowcentratedGovId && vault.cowcentratedStandardId
        ? 'both'
        : vault.cowcentratedGovId
        ? 'gov'
        : 'standard';
    const thisType = vault.type;
    const endOfKey = !fromVault
      ? `link-${availableTypes}`
      : `this-${thisType}${availableTypes === 'both' ? '-both' : ''}`;

    const components = useMemo(() => {
      return {
        GovLink: vault.cowcentratedGovId ? (
          <InternalLink to={`/vault/${vault.cowcentratedGovId}`} />
        ) : (
          <span />
        ),
        VaultLink: vault.cowcentratedStandardId ? (
          <InternalLink to={`/vault/${vault.cowcentratedStandardId}`} />
        ) : (
          <span />
        ),
      };
    }, [vault.cowcentratedGovId, vault.cowcentratedStandardId]);

    return (
      <Banner
        variant={variant}
        icon={<img src={clmIcon} alt="" width={24} height={24} />}
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

interface UnstakedClmBannerDashboardProps {
  address: string;
}

export const UnstakedClmBannerDashboard = memo<UnstakedClmBannerDashboardProps>(
  function UnstakedClmBannerDashboard({ address }) {
    const classes = useStyles();
    const unstakedIds = useAppSelector(state => selectUserUnstakedClms(state, address));

    if (!unstakedIds.length) {
      return null;
    }

    return (
      <div className={classes.clmUnstakedBannerContainer}>
        <Container maxWidth="lg">
          <UnstakedClmBanner />
        </Container>
      </div>
    );
  }
);
