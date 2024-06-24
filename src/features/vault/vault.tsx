import { Container, Hidden, makeStyles } from '@material-ui/core';
import type { PropsWithChildren } from 'react';
import React, { lazy, memo } from 'react';
import { Redirect, useParams } from 'react-router';
import { styles } from './styles';
import { SafetyCard } from './components/SafetyCard';
import { BoostCard } from './components/BoostCard';
import {
  selectVaultById,
  selectVaultExistsById,
  selectVaultIdIgnoreCase,
} from '../data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../data/selectors/boosts';
import type { VaultEntity } from '../data/entities/vault';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { TechLoader } from '../../components/TechLoader';
import { useAppSelector } from '../../store';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown';
import { AssetsCard } from './components/AssetsCard';
import { InsuranceCards } from './components/InsuranceCards';
import { LeverageCards } from './components/LeverageCards';
import { Actions } from './components/Actions';
import { VaultHeader } from './components/VaultHeader';
import { BusdBannerVault } from '../../components/Banners/BusdBanner';
import { VaultsStats } from './components/VaultsStats';
import { HistoricGraphsLoader } from './components/HistoricGraph';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet';
import { VaultMeta } from '../../components/Meta/VaultMeta';
import { PnLGraphIfWallet } from './components/PnLGraph/PnLGraphIfWallet';
import { Explainer } from './components/Explainer/Explainer';

const useStyles = makeStyles(styles);
const PageNotFound = lazy(() => import(`../../features/pagenotfound`));

type VaultUrlParams = {
  id: VaultEntity['id'];
};
export const Vault = memo(function Vault() {
  const { id } = useParams<VaultUrlParams>();
  const isLoaded = useAppSelector(selectIsConfigAvailable);
  const vaultExists = useAppSelector(state => selectVaultExistsById(state, id));

  if (!isLoaded) {
    return <TechLoader text="Loading..." />;
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
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const isBoostedOrPreStake = useAppSelector(state =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  return (
    <Container maxWidth="lg" className={classes.page}>
      <VaultMeta vaultId={vaultId} />
      <BusdBannerVault vaultId={vaultId} />
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
            <PnLGraphIfWallet vaultId={vaultId} walletAddress={walletAddress} />
            <HistoricGraphsLoader vaultId={vaultId} />
            <LiquidityPoolBreakdownLoader vaultId={vaultId} />
            <SafetyCard vaultId={vaultId} />
            <Explainer vaultId={vaultId} />
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
