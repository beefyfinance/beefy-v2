import { legacyMakeStyles } from '../../helpers/mui.ts';
import type { PropsWithChildren } from 'react';
import { lazy, memo } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { styles } from './styles.ts';
import { SafetyCard } from './components/SafetyCard/SafetyCard.tsx';
import { PromoCardLoader } from './components/BoostCard/PromoCardLoader.tsx';
import { selectVaultByIdOrUndefined, selectVaultIdIgnoreCase } from '../data/selectors/vaults.ts';
import {
  getCowcentratedPool,
  isCowcentratedVault,
  type VaultEntity,
} from '../data/entities/vault.ts';
import { selectIsConfigAvailable } from '../data/selectors/data-loader.ts';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { useAppSelector } from '../../store.ts';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown/LiquidityPoolBreakdown.tsx';
import { InsuranceCards } from './components/InsuranceCards/InsuranceCards.tsx';
import { LeverageCards } from './components/LeverageCards/LeverageCards.tsx';
import { Actions } from './components/Actions/Actions.tsx';
import { VaultHeader } from './components/VaultHeader/VaultHeader.tsx';
import { BusdBannerVault } from '../../components/Banners/BusdBanner/BusdBannerVault.tsx';
import { VaultsStats } from './components/VaultsStats/VaultsStats.tsx';
import { HistoricGraphsLoader } from './components/HistoricGraph/HistoricGraphsLoader.tsx';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet.ts';
import { VaultMeta } from '../../components/Meta/VaultMeta.tsx';
import { PnLGraphIfWallet } from './components/PnLGraph/PnLGraphIfWallet.tsx';
import { Explainer } from './components/Explainer/Explainer.tsx';
import { featureFlag_disableRedirect } from '../data/utils/feature-flags.ts';
import { GamingCards } from './components/GamingCards/GamingCards.tsx';
import { Container } from '../../components/Container/Container.tsx';
import { Details } from './components/Details/Details.tsx';
import { RetiredSuggestClmBanner } from '../../components/Banners/RetiredSuggestClmBanner/RetiredSuggestClmBanner.tsx';
import { Hidden } from '../../components/MediaQueries/Hidden.tsx';
import { UnstakedClmBannerVault } from '../../components/Banners/UnstakedClmBanner/UnstakedClmBannerVault.tsx';

const useStyles = legacyMakeStyles(styles);
const NotFoundPage = lazy(() => import('../../features/pagenotfound/NotFoundPage.tsx'));

type VaultUrlParams = {
  id: VaultEntity['id'];
};
const VaultPage = memo(function VaultPage() {
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
const VaultNotFound = memo(function VaultNotFound({ id }: VaultNotFoundProps) {
  const maybeVaultId = useAppSelector(state => selectVaultIdIgnoreCase(state, id));

  if (maybeVaultId !== undefined) {
    return <Redirect to={`/vault/${maybeVaultId}`} />;
  }

  return <NotFoundPage />;
});

type VaultContentProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;
const VaultContent = memo(function VaultContent({ vaultId }: VaultContentProps) {
  const classes = useStyles();
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);

  return (
    <Container maxWidth="lg" css={styles.page}>
      <VaultMeta vaultId={vaultId} />
      <BusdBannerVault vaultId={vaultId} />
      <UnstakedClmBannerVault vaultId={vaultId} fromVault={true} />
      <RetiredSuggestClmBanner vaultId={vaultId} />
      <VaultHeader vaultId={vaultId} />
      <VaultsStats vaultId={vaultId} />
      <div>
        <div className={classes.contentColumns}>
          <div className={classes.columnActions}>
            <Actions vaultId={vaultId} />
            <Hidden to="sm">
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
            <Hidden from="md">
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

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default VaultPage;
