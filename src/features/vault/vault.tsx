import { Container, Hidden, makeStyles } from '@material-ui/core';
import React, { lazy, memo, PropsWithChildren } from 'react';
import { Redirect, useParams } from 'react-router';
import { styles } from './styles';
import { StrategyCard } from './components/StrategyCard';
import { SafetyCard } from './components/SafetyCard';
import { HistoryGraph } from './components/HistoryGraph';
import { BoostCard } from './components/BoostCard';
import { GovDetailsCard } from './components/GovDetailsCard';
import {
  selectVaultById,
  selectVaultExistsById,
  selectVaultIdIgnoreCase,
} from '../data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../data/selectors/boosts';
import { isGovVault, VaultEntity } from '../data/entities/vault';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { CowLoader } from '../../components/CowLoader';
import { InfoCards } from './components/InfoCards/InfoCards';
import { VaultMeta } from './components/VaultMeta';
import { useAppSelector } from '../../store';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown';
import { AssetsCard } from './components/AssetsCard';
import { InsuranceCards } from './components/InsuranceCards';
import { LeverageCards } from './components/LeverageCards';
import { Actions } from './components/Actions';
import { VaultHeader } from './components/VaultHeader';
import { RenBannerVault } from '../../components/Banners/RenBanner';
import { PnLGraph } from './components/PnLGraph';
import { VaultsStats } from './components/VaultsStats';

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
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoostedOrPreStake = useAppSelector(state =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  return (
    <Container maxWidth="lg" className={classes.page}>
      <VaultMeta vaultId={vaultId} />
      <RenBannerVault vaultId={vaultId} />
      <VaultHeader vaultId={vaultId} />
      <VaultsStats vaultId={vaultId} />
      <div className={classes.contentContainer}>
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
            {!isGovVault(vault) ? <PnLGraph vaultId={vaultId} /> : null}
            {!isGovVault(vault) ? <HistoryGraph vaultId={vaultId} /> : null}
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
      </div>
    </Container>
  );
});
