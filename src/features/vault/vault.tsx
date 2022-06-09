import { Button, Container, Hidden, makeStyles } from '@material-ui/core';
import { lazy, memo, PropsWithChildren, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DisplayTags } from '../../components/vaultTags';
import { AssetsImage } from '../../components/AssetsImage';
import { styles } from './styles';
import { Deposit } from './components/Deposit';
import { Withdraw } from './components/Withdraw';
import { TokenCard } from './components/TokenCard';
import { StrategyCard } from './components/StrategyCard';
import { SafetyCard } from './components/SafetyCard';
import { Graph } from './components/Graph';
import { VaultsStats } from './components/VaultsStats';
import { BoostCard } from './components/BoostCard';
import { GovDetailsCard } from './components/GovDetailsCard';
import { QiDao } from './components/QiDaoCard';
import { Moonpot } from './components/MoonportCard';
import {
  selectVaultById,
  selectVaultExistsById,
  selectVaultIdIgnoreCase,
} from '../data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../data/selectors/boosts';
import { isGovVault, VaultEntity } from '../data/entities/vault';
import { selectChainById } from '../data/selectors/chains';
import {
  selectIsVaultInsurace,
  selectIsVaultMoonpot,
  selectIsVaultQidao,
  selectIsVaultSolace,
} from '../data/selectors/partners';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { CowLoader } from '../../components/CowLoader';
import { MinterCards } from './components/MinterCards';
import { InfoCards } from './components/InfoCards/InfoCards';
import { RetirePauseReason } from './components/RetirePauseReason';
import { InsuraceCard } from './components/InsuraceCard';
import { NexusCard } from './components/NexusCard';
import { SolaceCard } from './components/SolaceCard';
import { VaultMeta } from './components/VaultMeta';
import { useAppSelector } from '../../store';

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
  const [dw, setDw] = useState('deposit');
  const isMoonpot = useAppSelector(state => selectIsVaultMoonpot(state, vaultId));
  const isQidao = useAppSelector(state => selectIsVaultQidao(state, vaultId));
  const isInsurace = useAppSelector(state => selectIsVaultInsurace(state, vaultId));
  const isSolace = useAppSelector(state => selectIsVaultSolace(state, vaultId));

  return (
    <>
      <VaultMeta vaultId={vaultId} />
      <div className={classes.vaultContainer}>
        <Container maxWidth="lg">
          <div className={classes.header}>
            <div className={classes.titleHolder}>
              <AssetsImage assetIds={vault.assetIds} size={48} chainId={vault.chainId} />
              <h1 className={classes.title}>
                {vault.name} {!isGovVault(vault) ? t('Vault-vault') : ''}
              </h1>
            </div>
            <div>
              <div className={classes.badges}>
                <DisplayTags vaultId={vaultId} />
              </div>
              <div className={classes.platformContainer}>
                <div className={classes.platformLabel}>
                  {t('Chain')} <span>{chain.name}</span>
                </div>
                <div className={classes.platformLabel}>
                  {t('Platform')} <span>{vault.tokenDescription}</span>
                </div>
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
              <Hidden mdUp>
                <RetirePauseReason vaultId={vaultId} className={classes.retirePauseReason} />
              </Hidden>
              <div className={classes.dw}>
                <div className={classes.tabs}>
                  <Button
                    onClick={() => setDw('deposit')}
                    className={dw === 'deposit' ? classes.selected : ''}
                  >
                    {t('Deposit-Verb')}
                  </Button>
                  <Button
                    onClick={() => setDw('withdraw')}
                    className={dw === 'withdraw' ? classes.selected : ''}
                  >
                    {t('Withdraw-Verb')}
                  </Button>
                </div>
                {dw === 'deposit' ? <Deposit vaultId={vaultId} /> : <Withdraw vaultId={vaultId} />}
              </div>
              <MinterCards vaultId={vaultId} />
              <div>
                <NexusCard />
              </div>
              {isQidao && (
                <div>
                  <QiDao vaultId={vaultId} />
                </div>
              )}
              {isMoonpot && (
                <div>
                  <Moonpot vaultId={vaultId} />
                </div>
              )}
              {isInsurace && (
                <div>
                  <InsuraceCard />
                </div>
              )}
              {isSolace && (
                <div>
                  <SolaceCard />
                </div>
              )}
            </div>
            <div className={classes.columnInfo}>
              <Hidden smDown>
                <RetirePauseReason vaultId={vaultId} className={classes.retirePauseReason} />
              </Hidden>
              {isBoostedOrPreStake && <BoostCard vaultId={vaultId} />}
              {isGovVault(vault) && <GovDetailsCard vaultId={vaultId} />}
              {!isGovVault(vault) ? <Graph vaultId={vaultId} /> : null}
              <SafetyCard vaultId={vaultId} />
              {!isGovVault(vault) ? <StrategyCard vaultId={vaultId} /> : null}
              <InfoCards chainId={vault.chainId} vaultId={vault.id} />
              {vault.assetIds.map(tokenId => (
                <TokenCard key={tokenId} chainId={vault.chainId} tokenId={tokenId} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
});
