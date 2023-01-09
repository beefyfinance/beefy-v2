import { Container, Hidden, makeStyles } from '@material-ui/core';
import React, { lazy, memo, PropsWithChildren } from 'react';
import { Redirect, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../components/AssetsImage';
import { styles } from './styles';
import { StrategyCard } from './components/StrategyCard';
import { SafetyCard } from './components/SafetyCard';
import { Graph } from './components/Graph';
import { VaultsStats } from './components/VaultsStats';
import { BoostCard } from './components/BoostCard';
import { GovDetailsCard } from './components/GovDetailsCard';
import {
  selectVaultById,
  selectVaultExistsById,
  selectVaultIdIgnoreCase,
} from '../data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../data/selectors/boosts';
import { isGovVault, VaultEntity } from '../data/entities/vault';
import { selectChainById } from '../data/selectors/chains';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { CowLoader } from '../../components/CowLoader';
import { InfoCards } from './components/InfoCards/InfoCards';
import { VaultMeta } from './components/VaultMeta';
import { useAppSelector } from '../../store';
import { VaultPlatform } from '../../components/VaultPlatform';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown';
import { AssetsCard } from './components/AssetsCard';
import { InsuranceCards } from './components/InsuranceCards';
import { LeverageCards } from './components/LeverageCards';
import { Actions } from './components/Actions';
import { RenBannerVault } from '../../components/Banners/RenBanner';

const useStyles = makeStyles(styles);
const PageNotFound = lazy(() => import(`../../features/pagenotfound`));

type VaultUrlParams = {
  id: VaultEntity['id'];
};
export const Vault = memo(function Vault() {
  let { id } = useParams<VaultUrlParams>();
  const isLoaded = useAppSelector(selectIsConfigAvailable);
  const vaultExists = useAppSelector(state => selectVaultExistsById(state, id));

  if (!isLoaded) {
    return <CowLoader text="Loading..." />;
  }

  if (!vaultExists) {
    return <VaultNotFound id={id} />;
  }

  return <VaultContent vaultId={id} />;
});

type VaultNotFoundProps = PropsWithChildren<VaultUrlParams>;
const VaultNotFound = memo<VaultNotFoundProps>(function VaultNotFound({ id }) {
  const maybeVaultId = useAppSelector(state => selectVaultIdIgnoreCase(state, id));

  if (maybeVaultId !== undefined) {
    return <Redirect to={`/vault/${maybeVaultId}`} />;
  }

  return <PageNotFound />;
});

type VaultContentProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;
const VaultContent = memo<VaultContentProps>(function VaultContent({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const isBoostedOrPreStake = useAppSelector(state =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  return (
    <>
      <VaultMeta vaultId={vaultId} />
      <div className={classes.vaultContainer}>
        <RenBannerVault vaultId={vaultId} />
        <Container maxWidth="lg">
          <div className={classes.header}>
            <div className={classes.titleHolder}>
              <AssetsImage assetIds={vault.assetIds} size={48} chainId={vault.chainId} />
              <h1 className={classes.title}>
                {vault.name} {!isGovVault(vault) ? t('Vault-vault') : ''}
              </h1>
            </div>
            <div className={classes.platformContainer}>
              <div className={classes.platformLabel}>
                {t('Chain')} <span>{chain.name}</span>
              </div>
              <div className={classes.platformLabel}>
                {t('Platform')}{' '}
                <span>
                  <VaultPlatform vaultId={vaultId} />
                </span>
              </div>
            </div>
          </div>
          <VaultsStats vaultId={vaultId} />
        </Container>
      </div>
      <div className={classes.contentContainer}>
        <Container maxWidth="lg">
          <div className={classes.contentColumns}>
            <div className={classes.columnActions}>
              <Actions vaultId={vaultId} />
              <Hidden smDown>
                <InsuranceCards vaultId={vaultId} />
                <LeverageCards vaultId={vaultId} />
              </Hidden>
            </div>
            <div className={classes.columnInfo}>
              {isBoostedOrPreStake && <BoostCard vaultId={vaultId} />}
              {isGovVault(vault) && <GovDetailsCard vaultId={vaultId} />}
              {!isGovVault(vault) ? <Graph vaultId={vaultId} /> : null}
              <LiquidityPoolBreakdownLoader vaultId={vaultId} />
              <SafetyCard vaultId={vaultId} />
              {!isGovVault(vault) ? <StrategyCard vaultId={vaultId} /> : null}
              <InfoCards chainId={vault.chainId} vaultId={vault.id} />
              <AssetsCard vaultId={vault.id} />
              <Hidden mdUp>
                <InsuranceCards vaultId={vaultId} />
                <LeverageCards vaultId={vaultId} />
              </Hidden>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
});
