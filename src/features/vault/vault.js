import { Container, makeStyles, Grid, Typography, Box, Button, Divider } from '@material-ui/core';
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
import VaultStats from './components/VaultsStats';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <>
      <Box className={classes.vaultContainer}>
        <Container maxWidth="lg">
          {isLoading ? (
            <Loader message={t('Vault-GetData')} />
          ) : (
            <>
              <Box className={classes.title}>
                <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
                <Typography variant={'h1'}>
                  {item.name} {t('Vault-vault')}
                </Typography>
              </Box>
              <Box className={classes.badges}>
                <img
                  alt={item.network}
                  src={require('images/networks/' + item.network + '.svg').default}
                />
                <DisplayTags tags={item.tags} />
              </Box>
              <Box>
                <span className={classes.platformContainer}>
                  <Typography className={classes.platformLabel}>{t('PLATFORM')}:&nbsp;</Typography>
                  <Typography className={classes.platformValue}>{item.platform}</Typography>
                </span>
              </Box>
              <VaultStats item={item} />
            </>
          )}
        </Container>
      </Box>
      <Box style={{ marginTop: '24px' }}>
        <Container maxWidth="lg" my={5}>
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
              <Grid item xs={12} md={8}>
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

export default Vault;
