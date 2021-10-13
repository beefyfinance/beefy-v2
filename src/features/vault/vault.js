import { Container, makeStyles, Grid, Typography, Box, Button, Divider } from '@material-ui/core';
import { ArrowLeft } from '@material-ui/icons';
import * as React from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addressBook } from 'blockchain-addressbook';
import reduxActions from '../redux/actions';
import { calcDaily, formatApy, formatUsd } from 'helpers/format';
import { isEmpty } from 'helpers/utils';
import Loader from 'components/loader';
import DisplayTags from 'components/vaultTags';
import AssetsImage from 'components/AssetsImage';
import styles from './styles';
import Deposit from 'features/vault/components/Deposit';
import Withdraw from 'features/vault/components/Withdraw';
import TokenCard from 'features/vault/components/TokenCard';
import StrategyCard from 'features/vault/components/StrategyCard';
import SafetyCard from 'features/vault/components/SafetyCard';
import Graph from 'features/vault/components/Graph';
import { getEligibleZap } from 'helpers/zap';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles);

const Vault = () => {
  const history = useHistory();
  const classes = useStyles();
  const t = useTranslation().t;

  let { id } = useParams();
  const { vault, wallet, prices } = useSelector(state => ({
    vault: state.vaultReducer,
    wallet: state.walletReducer,
    prices: state.pricesReducer,
  }));
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const [item, setVaultData] = React.useState(null);
  const [dw, setDw] = React.useState('deposit');

  const [formData, setFormData] = React.useState({
    deposit: { input: '', amount: new BigNumber(0), max: false, token: null, isZap: false },
    withdraw: { input: '', amount: new BigNumber(0), max: false, token: null, isZap: false },
    zap: null,
  });

  const resetFormData = () => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '',
        amount: new BigNumber(0),
        max: false,
      },
      withdraw: {
        ...formData.withdraw,
        input: '',
        amount: new BigNumber(0),
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
      setIsLoading(false);
    }
  }, [item]);

  React.useEffect(() => {
    if (item && prices.lastUpdated > 0) {
      dispatch(reduxActions.vault.fetchPools(item));
    }
  }, [dispatch, item, prices.lastUpdated]);

  React.useEffect(() => {
    if (item && wallet.address) {
      dispatch(reduxActions.balance.fetchBalances());
    }
  }, [dispatch, item, wallet.address]);

  React.useEffect(() => {
    if (item) {
      setInterval(() => {
        dispatch(reduxActions.vault.fetchPools(item));
        dispatch(reduxActions.balance.fetchBalances());
      }, 60000);
    }
  }, [item, dispatch]);

  return (
    <Container className={classes.vaultContainer} maxWidth="lg">
      {isLoading ? (
        <Loader message={t('Vault-GetData')} />
      ) : (
        <Grid container spacing={6} style={{ position: 'relative' }}>
          <Grid item xs={12} md={8} lg={8} xl={9}>
            <Button
              className={classes.btnGoBack}
              onClick={() => {
                history.push('/');
              }}
            >
              <ArrowLeft /> {t('Vault-GoBack')}
            </Button>
            <Grid className={classes.title} container>
              <Grid>
                <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
              </Grid>
              <Grid>
                <Typography variant={'h1'}>
                  {item.name} {t('Vault-vault')}
                </Typography>
              </Grid>
            </Grid>
            <Box className={classes.mobileFix} display="flex" alignItems="center">
              <Box className={classes.badges}>
                <Box>
                  <img
                    alt={item.network}
                    src={require('images/networks/' + item.network + '.svg').default}
                  />
                </Box>
                <Box>
                  <Typography className={classes.network} display={'inline'}>
                    {item.network} {t('Vault-network')}
                  </Typography>
                </Box>
                <DisplayTags tags={item.tags} />
              </Box>
              <Box className={classes.summaryContainer} display={'flex'} alignItems="center">
                <Divider />
                <Box>
                  <Typography variant={'h1'}>{formatUsd(item.tvl)}</Typography>
                  <Typography variant={'body2'}>{t('TVL')}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant={'h1'}>{calcDaily(item.apy.totalApy)}</Typography>
                  <Typography variant={'body2'}>{t('Vault-Daily')}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant={'h1'}>{formatApy(item.apy.totalApy)}</Typography>
                  <Typography variant={'body2'}>{t('APY')}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
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
                  item={item}
                  handleWalletConnect={handleWalletConnect}
                  formData={formData}
                  setFormData={setFormData}
                  updateItemData={updateItemData}
                  resetFormData={resetFormData}
                />
              ) : (
                <Withdraw
                  item={item}
                  handleWalletConnect={handleWalletConnect}
                  formData={formData}
                  setFormData={setFormData}
                  updateItemData={updateItemData}
                  resetFormData={resetFormData}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Graph oracleId={item.oracleId} vaultId={item.id} network={item.network} />
            {item.risks && item.risks.length > 0 && (
              <SafetyCard vaultRisks={item.risks} score={item.safetyScore} />
            )}
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
            />
            {renderTokens(item)}
          </Grid>
        </Grid>
      )}
    </Container>
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

export default Vault;
