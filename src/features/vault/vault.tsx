import { Container, makeStyles, Grid, Typography, Box, Button } from '@material-ui/core';
import * as React from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addressBook as _addressBook } from 'blockchain-addressbook';
import { reduxActions } from '../redux/actions';
import { Loader } from '../../components/loader';
import { DisplayTags } from '../../components/vaultTags';
import { AssetsImage } from '../../components/AssetsImage';
import { styles } from './styles';
import { Deposit } from './components/Deposit';
import { Withdraw } from './components/Withdraw';
import { TokenCard } from './components/TokenCard';
import { StrategyCard } from './components/StrategyCard';
import { SafetyCard } from './components/SafetyCard';
import { Graph } from './components/Graph';
import { getEligibleZap } from '../../helpers/zap';
import { BIG_ZERO } from '../../helpers/format';
import { VaultsStats } from './components/VaultsStats';
import { BoostCard } from './components/BoostCard';
import { GovDetailsCard } from './components/GovDetailsCard';
import { QiDao } from './components/QiDaoCard';
import { Insurace } from './components/InsuraceCard';
import { Spirit } from './components/SpiritCard';
import { Moonpot } from './components/MoonportCard';
import { selectVaultById } from '../data/selectors/vaults';
import { BeefyState } from '../../redux-types';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
} from '../data/selectors/boosts';
import { selectIsWalletConnected, selectWalletAddress } from '../data/selectors/wallet';
import { isGovVault, VaultEntity } from '../data/entities/vault';
import { selectChainById } from '../data/selectors/chains';
import { selectVaultEligibleZap } from '../data/selectors/zaps';
import {
  selectIsVaultBinSpirit,
  selectIsVaultInsurace,
  selectIsVaultMoonpot,
  selectIsVaultQidao,
} from '../data/selectors/partners';
import { TokenEntity } from '../data/entities/token';
import { selectTokenById } from '../data/selectors/tokens';
import { selectPlatformById } from '../data/selectors/platforms';

//allow the Harmony-blockchain entries in the address-book to be accessed via the normal
//  "network" property values used in our core vault-object schema
const addressBook = { ..._addressBook, harmony: _addressBook.one };

const useStyles = makeStyles(styles as any);

export const Vault = () => {
  const history = useHistory();
  const classes = useStyles();
  const t = useTranslation().t;

  let { id }: any = useParams();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, id));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const platform = useSelector((state: BeefyState) => selectPlatformById(state, vault.platformId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, id));
  const vaultBoosts = useSelector((state: BeefyState) =>
    selectActiveVaultBoostIds(state, id).map(boostId => selectBoostById(state, boostId))
  );
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const walletAddress = useSelector((state: BeefyState) =>
    isWalletConnected ? selectWalletAddress(state) : null
  );
  const eligibleZap = useSelector((state: BeefyState) => selectVaultEligibleZap(state, id));
  const dispatch = useDispatch();
  const [dw, setDw] = React.useState('deposit');
  const isMoonpot = useSelector((state: BeefyState) => selectIsVaultMoonpot(state, id));
  const isQidao = useSelector((state: BeefyState) => selectIsVaultQidao(state, id));
  const isBinSpirit = useSelector((state: BeefyState) => selectIsVaultBinSpirit(state, id));
  const isInsurace = useSelector((state: BeefyState) => selectIsVaultInsurace(state, id));

  const boostedData = {} as any; //vault.pools[id].boostData;

  const [formData, setFormData] = React.useState({
    deposit: {
      input: '',
      amount: BIG_ZERO,
      max: false,
      token: vault.oracleId,
      isZap: false,
      zapEstimate: {
        isLoading: true,
      },
    },
    withdraw: {
      input: '',
      amount: BIG_ZERO,
      max: false,
      token: vault.oracleId,
      isZap: false,
      isZapSwap: false,
      zapEstimate: {
        isLoading: true,
      },
    },
    zap: eligibleZap,
    slippageTolerance: 0.01,
  });
  /*
  React.useEffect(() => {
    if (formData.deposit.isZap && formData.deposit.token) {
      reduxActions.vault.estimateZapDeposit({
        web3: wallet.rpc,
        vault: item,
        formData,
        setFormData,
      });
    }
    // eslint-disable-next-line
  }, [formData.deposit.amount, formData.deposit.isZap, formData.deposit.token, wallet.rpc, item]);
*/
  /*
  React.useEffect(() => {
    document.body.style.backgroundColor = '#1B203A';
  }, []);
*/
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
                  <DisplayTags vaultId={vault.id} />
                </Box>
                <Box>
                  <span className={classes.platformContainer}>
                    <Box className={classes.chainContainer}>
                      <Typography className={classes.platformLabel}>
                        {t('Chain')}: <span>{chain.name}</span>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className={classes.platformLabel}>
                        {t('PLATFORM')}: <span>{platform.name}</span>
                      </Typography>
                    </Box>
                  </span>
                </Box>
              </Box>
            </Box>
            <VaultsStats vaultId={vault.id} />
          </>
        </Container>
      </Box>
      <Box style={{ marginTop: '24px' }}>
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
                {/*dw === 'deposit' ? (
                  <Deposit
                    vaultId={vault.id}
                    formData={formData}
                    setFormData={setFormData}
                    resetFormData={resetFormData}
                  />
                ) : (
                  <Withdraw
                    vaultId={vault.id}
                    formData={formData}
                    setFormData={setFormData}
                    resetFormData={resetFormData}
                  />
                )*/}
              </Box>
              {isQidao && (
                <Box>
                  <QiDao vaultId={vault.id} />
                </Box>
              )}
              {isBinSpirit && (
                <Box>
                  <Spirit vaultId={vault.id} />
                </Box>
              )}
              {isMoonpot && (
                <Box>
                  <Moonpot vaultId={vault.id} />
                </Box>
              )}
              {isInsurace && (
                <Box>
                  <Insurace />
                </Box>
              )}
            </Grid>
            {/* 
            <Grid item xs={12} md={8} className={classes.customOrder2}>
              {isBoosted && <BoostCard vaultId={vault.id} />}
              {isGovVault(vault) && <GovDetailsCard vaultId={vault.id} />}
              {!isGovVault(vault) ? <Graph vaultId={vault.id} /> : null}
              <SafetyCard vaultId={vault.id} />
              {!isGovVault(vault) ? <StrategyCard vaultId={vault.id} /> : null}
              <VaultAssets vaultId={vault.id} />
            </Grid>*/}
          </Grid>
        </Container>
      </Box>
    </>
  ); //return
}; //const Vault

const VaultAssets = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const tokens = vault.assetIds.map(assetId => selectTokenById(state, vault.chainId, assetId));
  return { tokens };
})(({ tokens }: { tokens: TokenEntity[] }) => {
  return (
    <>
      {tokens.map(token => (
        <TokenCard key={token.id} token={token} />
      ))}
    </>
  );
});
