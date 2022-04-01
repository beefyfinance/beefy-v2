import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
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
import { Insurace } from './components/InsuraceCard';
import { Moonpot } from './components/MoonportCard';
import { selectVaultById } from '../data/selectors/vaults';
import { BeefyState } from '../../redux-types';
import { selectIsVaultPreStakedOrBoosted } from '../data/selectors/boosts';
import { isGovVault } from '../data/entities/vault';
import { selectChainById } from '../data/selectors/chains';
import {
  selectIsVaultInsurace,
  selectIsVaultLacucina,
  selectIsVaultMoonpot,
  selectIsVaultQidao,
} from '../data/selectors/partners';
import { selectIsConfigAvailable } from '../data/selectors/data-loader';
import { CowLoader } from '../../components/CowLoader';
import { LaCucina } from './components/LaCucinaCard';
import { Nexus } from './components/NexusCard';
import { selectMintersByVaultId } from '../data/selectors/minters';
import { MinterCard } from './components/MinterCard';

const useStyles = makeStyles(styles as any);

export const Vault = () => {
  const isLoaded = useSelector((state: BeefyState) => selectIsConfigAvailable(state));

  return isLoaded ? <VaultContent /> : <CowLoader text="Loading..." />;
};

const VaultContent = React.memo(() => {
  const classes = useStyles();
  const { t } = useTranslation();
  let { id: vaultId }: any = useParams();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const isBoostedOrPreStake = useSelector((state: BeefyState) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );
  const [dw, setDw] = React.useState('deposit');
  const isMoonpot = useSelector((state: BeefyState) => selectIsVaultMoonpot(state, vaultId));
  const isQidao = useSelector((state: BeefyState) => selectIsVaultQidao(state, vaultId));
  const isInsurace = useSelector((state: BeefyState) => selectIsVaultInsurace(state, vaultId));
  const isLaCucina = useSelector((state: BeefyState) => selectIsVaultLacucina(state, vaultId));
  const minterCardIds = useSelector((state: BeefyState) => selectMintersByVaultId(state, vaultId));

  return (
    <>
      <Box className={classes.vaultContainer}>
        <Container maxWidth="lg">
          <>
            <Box className={classes.header}>
              <Box className={classes.title}>
                <AssetsImage img={vault.logoUri} assets={vault.assetIds} alt={vault.name} />
                <Typography variant="h2">
                  {vault.name} {!isGovVault(vault) ? t('Vault-vault') : ''}
                </Typography>
              </Box>
              <Box>
                <Box className={classes.badges}>
                  <DisplayTags vaultId={vaultId} />
                </Box>
                <Box>
                  <span className={classes.platformContainer}>
                    <Box className={classes.chainContainer}>
                      <Typography className={classes.platformLabel}>
                        {t('Chain')} <span>{chain.name}</span>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className={classes.platformLabel}>
                        {t('Platform')} <span>{vault.tokenDescription}</span>
                      </Typography>
                    </Box>
                  </span>
                </Box>
              </Box>
            </Box>
            <VaultsStats vaultId={vaultId} />
          </>
        </Container>
      </Box>
      <Box className={classes.contentContainer}>
        <Container {...({ maxWidth: 'lg', my: 5 } as any)}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4} className={classes.customOrder}>
              <Box className={classes.dw}>
                <Box className={classes.tabs}>
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
                </Box>
                {dw === 'deposit' ? <Deposit vaultId={vaultId} /> : <Withdraw vaultId={vaultId} />}
              </Box>
              {minterCardIds.map(minterId => (
                <Box key={minterId}>
                  <MinterCard vaultId={vaultId} minterId={minterId} />
                </Box>
              ))}
              <Box>
                <Nexus />
              </Box>
              {isQidao && (
                <Box>
                  <QiDao vaultId={vaultId} />
                </Box>
              )}
              {isMoonpot && (
                <Box>
                  <Moonpot vaultId={vaultId} />
                </Box>
              )}
              {isLaCucina && (
                <Box>
                  <LaCucina vaultId={vaultId} />
                </Box>
              )}
              {isInsurace && (
                <Box>
                  <Insurace />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={8} className={classes.customOrder2}>
              {isBoostedOrPreStake && <BoostCard vaultId={vaultId} />}
              {isGovVault(vault) && <GovDetailsCard vaultId={vaultId} />}
              {!isGovVault(vault) ? <Graph vaultId={vaultId} /> : null}
              <SafetyCard vaultId={vaultId} />
              {!isGovVault(vault) ? <StrategyCard vaultId={vaultId} /> : null}
              {vault.assetIds.map(tokenId => (
                <TokenCard key={tokenId} chainId={vault.chainId} tokenId={tokenId} />
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
});
