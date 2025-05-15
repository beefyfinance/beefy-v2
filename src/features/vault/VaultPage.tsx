import type { PropsWithChildren } from 'react';
import { lazy, memo } from 'react';
import { Navigate, useParams } from 'react-router';
import { Container } from '../../components/Container/Container.tsx';
import { Hidden } from '../../components/MediaQueries/Hidden.tsx';
import { VaultMeta } from '../../components/Meta/VaultMeta.tsx';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppSelector } from '../data/store/hooks.ts';
import { type VaultEntity } from '../data/entities/vault.ts';
import { selectVaultIdForVaultPage } from '../data/selectors/vaults.ts';
import { Actions } from './components/Actions/Actions.tsx';
import { VaultBanners } from './components/Banners/VaultBanners.tsx';
import { PromoCardLoader } from './components/BoostCard/PromoCardLoader.tsx';
import { Details } from './components/Details/Details.tsx';
import { Explainer } from './components/Explainer/Explainer.tsx';
import { GamingCards } from './components/GamingCards/GamingCards.tsx';
import { HistoricGraphsLoader } from './components/HistoricGraph/HistoricGraphsLoader.tsx';
import { InsuranceCards } from './components/InsuranceCards/InsuranceCards.tsx';
import { LeverageCards } from './components/LeverageCards/LeverageCards.tsx';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown/LiquidityPoolBreakdown.tsx';
import { PnLGraphIfWallet } from './components/PnLGraph/PnLGraphIfWallet.tsx';
import { SafetyCard } from './components/SafetyCard/SafetyCard.tsx';
import { VaultHeader } from './components/VaultHeader/VaultHeader.tsx';
import { VaultsStats } from './components/VaultsStats/VaultsStats.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);
const NotFoundPage = lazy(() => import('../../features/pagenotfound/NotFoundPage.tsx'));

type VaultUrlParams = {
  id: VaultEntity['id'];
};

const VaultPage = memo(function VaultPage() {
  const { id: maybeId } = useParams<VaultUrlParams>();
  const idOrStatus = useAppSelector(state => selectVaultIdForVaultPage(state, maybeId));
  if (idOrStatus === 'loading') {
    return <TechLoader text="Loading..." />;
  } else if (idOrStatus === 'not-found') {
    return <NotFoundPage />;
  } else if (idOrStatus !== maybeId) {
    return <Navigate to={`/vault/${idOrStatus}`} />;
  }
  return <VaultContent vaultId={idOrStatus} />;
});

type VaultContentProps = PropsWithChildren<{
  vaultId: VaultEntity['id'];
}>;
const VaultContent = memo(function VaultContent({ vaultId }: VaultContentProps) {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.page}>
      <VaultMeta vaultId={vaultId} />
      <VaultBanners vaultId={vaultId} />
      <VaultHeader vaultId={vaultId} />
      <VaultsStats vaultId={vaultId} />
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
          <PnLGraphIfWallet vaultId={vaultId} />
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
    </Container>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default VaultPage;
