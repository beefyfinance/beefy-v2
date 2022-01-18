import { Container, makeStyles, Grid, Typography, Box, Button } from '@material-ui/core';
import * as React from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addressBook as _addressBook } from 'blockchain-addressbook';
import { reduxActions } from '../redux/actions';
import { isEmpty } from '../../helpers/utils';
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
import { LaCucina } from './components/LaCucinaCard';
import { Spirit } from './components/SpiritCard';
// import { Moonpot } from './components/MoonportCard';

//allow the Harmony-blockchain entries in the address-book to be accessed via the normal
//  "network" property values used in our core vault-object schema
const addressBook = { ..._addressBook, harmony: _addressBook.one };

const useStyles = makeStyles(styles as any);

export const Vault = () => {
  const history = useHistory();
  const classes = useStyles();
  const t = useTranslation().t;

  let { id }: any = useParams();
  const { vault, wallet } = useSelector((state: any) => ({
    vault: state.vaultReducer,
    wallet: state.walletReducer,
  }));
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGovVault, setIsGovVault] = React.useState(false);
  const [item, setVaultData] = React.useState(null);
  const [dw, setDw] = React.useState('deposit');

  const isBoosted = vault.pools[id].isBoosted;
  const boostedData = vault.pools[id].boostData;
  const vaultBoosts = vault.pools[id].boosts;

  const [formData, setFormData] = React.useState({
    deposit: {
      input: '',
      amount: BIG_ZERO,
      max: false,
      token: null,
      isZap: false,
      zapEstimate: {
        isLoading: true,
      },
    },
    withdraw: {
      input: '',
      amount: BIG_ZERO,
      max: false,
      token: null,
      isZap: false,
      isZapSwap: false,
      zapEstimate: {
        isLoading: true,
      },
    },
    zap: null,
    slippageTolerance: 0.01,
  });

  const resetFormData = () => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '',
        amount: BIG_ZERO,
        max: false,
      },
      withdraw: {
        ...formData.withdraw,
        input: '',
        amount: BIG_ZERO,
        max: false,
      },
    });
  };

  const handleWalletConnect = () => {
    if (!wallet.address) {
      dispatch(reduxActions.wallet.connect());
    }
  };

  const updateItemData = () => {
    if (wallet.address && item) {
      dispatch(reduxActions.vault.fetchPools(item));
      dispatch(reduxActions.balance.fetchBalances(item));
    }
  };

  React.useEffect(() => {
    if (!isEmpty(vault.pools) && vault.pools[id]) {
      setVaultData(vault.pools[id]);
    } else {
      history.push('/error');
    }
  }, [vault.pools, id, history]);

  React.useEffect(() => {
    if (item) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          token: item.token,
        },
        withdraw: {
          ...formData.withdraw,
          token: item.token,
        },
        zap: getEligibleZap(item),
      });
      setIsGovVault(item.isGovVault);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

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

  React.useEffect(() => {
    document.body.style.backgroundColor = '#1B203A';
  }, []);

  return (
    <>
      {console.log(item)}
      <Box className={classes.vaultContainer}>
        <Container maxWidth="lg">
          {isLoading ? (
            <Loader message={t('Vault-GetData')} />
          ) : (
            <>
              <Box className={classes.header}>
                <Box className={classes.title}>
                  <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
                  <Typography variant="h2">
                    {item.name} {!item.isGovVault ? t('Vault-vault') : ''}
                  </Typography>
                </Box>
                <Box>
                  <Box className={classes.badges}>
                    <DisplayTags isBoosted={isBoosted} tags={item.tags} />
                  </Box>
                  <Box>
                    <span className={classes.platformContainer}>
                      <Box className={classes.chainContainer}>
                        <Typography className={classes.platformLabel}>
                          {t('Chain')}: <span>{item.network}</span>
                        </Typography>
                      </Box>
                      <Box>
                        <Typography className={classes.platformLabel}>
                          {t('PLATFORM')}: <span>{item.platform}</span>
                        </Typography>
                      </Box>
                    </span>
                  </Box>
                </Box>
              </Box>
              <VaultsStats
                item={item}
                isBoosted={isBoosted}
                boostedData={boostedData}
                vaultBoosts={vaultBoosts}
              />
            </>
          )}
        </Container>
      </Box>
      <Box style={{ marginTop: '24px' }}>
        <Container {...({ maxWidth: 'lg', my: 5 } as any)}>
          {isLoading ? (
            <Loader message={t('Vault-GetData')} />
          ) : (
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
                  {dw === 'deposit' ? (
                    <Deposit
                      boostedData={boostedData}
                      isBoosted={isBoosted}
                      vaultBoosts={vaultBoosts}
                      item={item}
                      handleWalletConnect={handleWalletConnect}
                      formData={formData}
                      setFormData={setFormData}
                      updateItemData={updateItemData}
                      resetFormData={resetFormData}
                    />
                  ) : (
                    <Withdraw
                      boostedData={boostedData}
                      isBoosted={isBoosted}
                      vaultBoosts={vaultBoosts}
                      item={item}
                      handleWalletConnect={handleWalletConnect}
                      formData={formData}
                      setFormData={setFormData}
                      updateItemData={updateItemData}
                      resetFormData={resetFormData}
                    />
                  )}
                </Box>
                {/*QiDao card */}
                {item.isQidao && (
                  <Box>
                    {' '}
                    <QiDao mooToken={item.earnedToken} />
                  </Box>
                )}
                {/* Insurace card */}
                {item.isInsurace && (
                  <Box>
                    <Insurace />
                  </Box>
                )}
                {/*LaCucina Card */}
                {item.isLaCucina && (
                  <Box>
                    <LaCucina />
                  </Box>
                )}
                {/*Spirit Card */}
                {item.isBinSpirit && (
                  <Box>
                    <Spirit item={item} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={8} className={classes.customOrder2}>
                {/* TODO: Show only for boosts */}
                {isBoosted && <BoostCard boostedData={boostedData} />}
                {/* TODO: Show only for gov pools */}
                {isGovVault && <GovDetailsCard earnedToken={item.earnedToken} />}
                {!isGovVault ? (
                  <Graph oracleId={item.oracleId} vaultId={item.id} network={item.network} />
                ) : null}

                {item.risks && item.risks.length > 0 && (
                  <SafetyCard vaultRisks={item.risks} score={item.safetyScore} />
                )}
                {!isGovVault ? (
                  <StrategyCard
                    stratType={item.stratType}
                    stratAddr={item.strategy}
                    vaultAddr={item.earnContractAddress}
                    network={item.network}
                    apy={item.apy}
                    platform={item.platform}
                    assets={item.assets}
                    want={item.name}
                    vamp={item.vamp}
                    isBoosted={isBoosted}
                    boostedData={boostedData}
                    isGovVault={isGovVault}
                  />
                ) : null}
                {renderTokens(item)}
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </>
  ); //return
}; //const Vault

const renderTokens = item => {
  return item.assets.map(asset => {
    if (asset in addressBook[item.network].tokens) {
      return (
        <TokenCard
          key={asset}
          token={addressBook[item.network].tokens[asset]}
          network={item.network}
        />
      );
    } else return null;
  });
};
