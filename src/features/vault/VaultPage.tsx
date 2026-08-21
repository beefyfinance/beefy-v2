import type { PropsWithChildren } from 'react';
import { lazy, memo } from 'react';
import { Navigate, useParams } from 'react-router';
import { Container } from '../../components/Container/Container.tsx';
import { Hidden } from '../../components/MediaQueries/Hidden.tsx';
import { VaultMeta } from '../../components/Meta/VaultMeta.tsx';
import { FullscreenTechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppSelector } from '../data/store/hooks.ts';
import type { VaultEntity } from '../data/entities/vault.ts';
import { selectVaultIdForVaultPage } from '../data/selectors/vaults.ts';
import { selectClmDisplayVaultId } from '../data/selectors/apy.ts';
import { selectClmPositionVaultId } from '../data/selectors/balance.ts';
import { ClmModeContext, useClmModeController } from './components/ClmMode/ClmModeContext.tsx';
import { Actions } from './components/Actions/Actions.tsx';
import { VaultBanners } from './components/Banners/VaultBanners.tsx';
import { PromoCardLoader } from './components/BoostCard/PromoCardLoader.tsx';
import { FreeZapPromotionCardLoader } from './components/FreeZapCard/FreeZapPromotionCardLoader.tsx';
import { Details } from './components/Details/Details.tsx';
import { Explainer } from './components/Explainer/Explainer.tsx';
import { GamingCards } from './components/GamingCards/GamingCards.tsx';
import { HistoricGraphsLoader } from './components/HistoricGraph/HistoricGraphsLoader.tsx';
import { InsuranceCards } from './components/InsuranceCards/InsuranceCards.tsx';
import { LeverageCards } from './components/LeverageCards/LeverageCards.tsx';
import { LiquidityPoolBreakdownLoader } from './components/LiquidityPoolBreakdown/LiquidityPoolBreakdown.tsx';
import { PnLGraphIfWallet } from './components/PnLGraph/PnLGraphIfWallet.tsx';
import { PointsBannerLoader } from './components/PointsBanner/PointsBannerLoader.tsx';
import { RiskChecklistCard } from './components/RiskChecklistCard/RiskChecklistCard.tsx';
import { VaultHeader } from './components/VaultHeader/VaultHeader.tsx';
import { VaultsStats } from './components/VaultsStats/VaultsStats.tsx';
import { styles } from './styles.ts';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';

const useStyles = legacyMakeStyles(styles);
const NotFoundPage = lazy(() => import('../../features/pagenotfound/NotFoundPage.tsx'));

type VaultUrlParams = {
  id: VaultEntity['id'];
};

const VaultPage = memo(function VaultPage() {
  const { id: maybeId } = useParams<VaultUrlParams>();
  const idOrStatus = useAppSelector(state => selectVaultIdForVaultPage(state, maybeId));
  if (idOrStatus === 'loading') {
    return <FullscreenTechLoader text="Loading..." />;
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
  const clmMode = useClmModeController(vaultId);
  // the yield mode routes deposits and withdrawals only; the rest of the page is the whole CLM
  const modeVaultId = clmMode?.selectedVaultId ?? vaultId;
  // rates, promos and partnerships come from the same side the vault list row shows
  const displayVaultId = useAppSelector(state => selectClmDisplayVaultId(state, vaultId));
  // the position sections follow the user's money, never the toggle
  const positionVaultId = useAppSelector(state => selectClmPositionVaultId(state, vaultId));

  const content = (
    <PageLayout
      content={
        <Container maxWidth="lg" className={classes.page}>
          <VaultMeta vaultId={vaultId} />
          <VaultBanners vaultId={vaultId} />
          <div className={classes.header}>
            <VaultHeader vaultId={vaultId} />
            <VaultsStats vaultId={vaultId} modeVaultId={displayVaultId} />
          </div>
          <div className={classes.contentColumns}>
            <div className={classes.columnActions}>
              <Actions vaultId={modeVaultId} />
              <Hidden to="sm">
                <InsuranceCards vaultId={displayVaultId} />
                <LeverageCards vaultId={displayVaultId} />
                <GamingCards vaultId={displayVaultId} />
              </Hidden>
            </div>
            <div className={classes.columnInfo}>
              <FreeZapPromotionCardLoader vaultId={vaultId} />
              <PromoCardLoader vaultId={displayVaultId} />
              <PointsBannerLoader vaultId={vaultId} />
              <PnLGraphIfWallet vaultId={positionVaultId} />
              <HistoricGraphsLoader vaultId={displayVaultId} />
              <LiquidityPoolBreakdownLoader vaultId={displayVaultId} />
              <Explainer vaultId={displayVaultId} />
              <RiskChecklistCard vaultId={vaultId} />
              <Details vaultId={displayVaultId} />
              <Hidden from="md">
                <InsuranceCards vaultId={displayVaultId} />
                <LeverageCards vaultId={displayVaultId} />
                <GamingCards vaultId={displayVaultId} />
              </Hidden>
            </div>
          </div>
        </Container>
      }
    />
  );

  return clmMode ?
      <ClmModeContext.Provider value={clmMode}>{content}</ClmModeContext.Provider>
    : content;
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default VaultPage;
