import { Hidden, makeStyles } from '@material-ui/core';
import type { PropsWithChildren } from 'react';
import { lazy, memo } from 'react';
import { Redirect, useParams } from 'react-router';
import { styles } from './styles';
import { SafetyCard } from './components/SafetyCard';
import { PromoCardLoader } from './components/BoostCard';
import { selectVaultByIdOrUndefined, selectVaultIdIgnoreCase } from '../data/selectors/vaults';
import { getCowcentratedPool, isCowcentratedVault, type VaultEntity } from '../data/entities/vault';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { TechLoader } from '../../components/TechLoader';
import { useAppSelector } from '../../store';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown';
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
import { UnstakedClmBannerVault } from '../../components/Banners/UnstakedClmBanner/UnstakedClmBanner';
import { featureFlag_disableRedirect } from '../data/utils/feature-flags';
import { GamingCards } from './components/GamingCards';
import { Container } from '../../components/Container/Container';
import { Details } from './components/Details';
import { RetiredSuggestClmBanner } from '../../components/Banners/RetiredSuggestClmBanner';

const useStyles = makeStyles(styles);
const PageNotFound = lazy(() => import(`../../features/pagenotfound`));

type VaultUrlParams = {
  id: VaultEntity['id'];
};
export const Vault = memo(function Vault() {
  const { id } = useParams<VaultUrlParams>();
  const isLoaded = useAppSelector(selectIsConfigAvailable);
  const vault = useAppSelector(state => selectVaultByIdOrUndefined(state, id));

  if (!isLoaded) {
    return <TechLoader text="Loading..." />;
  }

  // CLM -> CLM Pool
  if (vault && vault.hidden && isCowcentratedVault(vault)) {
    const poolId = getCowcentratedPool(vault);
    if (poolId) {
      return featureFlag_disableRedirect() ? (
        <VaultContent vaultId={id} />
      ) : (
        <Redirect to={`/vault/${poolId}`} />
      );
    }
  }

  if (!vault || vault.hidden) {
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
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);

  return (
    <Container maxWidth="lg" className={classes.page}>
      <VaultMeta vaultId={vaultId} />
      <BusdBannerVault vaultId={vaultId} />
      <UnstakedClmBannerVault vaultId={vaultId} fromVault={true} />
      <RetiredSuggestClmBanner vaultId={vaultId} />
      <VaultHeader vaultId={vaultId} />
      <VaultsStats vaultId={vaultId} />
      <div className={classes.contentContainer}>
        <div className={classes.contentColumns}>
          <div className={classes.columnActions}>
            <Actions vaultId={vaultId} />
            <Hidden smDown>
              <InsuranceCards vaultId={vaultId} />
              <LeverageCards vaultId={vaultId} />
              <GamingCards vaultId={vaultId} />
            </Hidden>
          </div>
          <div className={classes.columnInfo}>
            <PromoCardLoader vaultId={vaultId} />
            <PnLGraphIfWallet vaultId={vaultId} walletAddress={walletAddress} />
            <HistoricGraphsLoader vaultId={vaultId} />
            <LiquidityPoolBreakdownLoader vaultId={vaultId} />
            <SafetyCard vaultId={vaultId} />
            <Explainer vaultId={vaultId} />
            <Details vaultId={vaultId} />
            <Hidden mdUp>
              <InsuranceCards vaultId={vaultId} />
              <LeverageCards vaultId={vaultId} />
              <GamingCards vaultId={vaultId} />
            </Hidden>
          </div>
        </div>
      </div>
    </Container>
  );
});
