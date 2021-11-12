import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Container,
  Fade,
  Grid,
  Link,
  makeStyles,
  Modal,
  Paper,
  Typography,
} from '@material-ui/core';
import { Loader } from '../../components/loader';
import { ArrowLeft, Language, Telegram, Twitter } from '@material-ui/icons';
import { styles } from './styles';
import { isEmpty } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../components/AssetsImage';
import { reduxActions } from '../redux/actions';
import { byDecimals, convertAmountToRawNumber, formatApy, formatUsd } from '../../helpers/format';
import BigNumber from 'bignumber.js';
import { Stake } from './components/Stake';
import { Unstake } from './components/Unstake';
import { Steps } from '../../components/Steps';

const useStyles = makeStyles(styles as any);
export const Boost = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  let { id, network }: any = useParams();
  const { vault, wallet, balance } = useSelector((state: any) => ({
    vault: state.vaultReducer,
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));

  const [isLoading, setIsLoading] = React.useState(true);
  const [item, setItemData] = React.useState(null);
  const [dw, setDw] = React.useState('deposit');
  const [inputModal, setInputModal] = React.useState(false);
  const [state, setState] = React.useState({
    balance: 0,
    deposited: 0,
    allowance: 0,
    poolPercentage: 0,
    rewards: 0,
  });
  const [formData, setFormData] = React.useState({
    deposit: { amount: '', max: false },
    withdraw: { amount: '', max: false },
  });
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  const handleClaimRewards = () => {
    const steps = [];
    if (wallet.address) {
      if (network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(network));
        return false;
      }

      steps.push({
        step: 'claim',
        message: t('Vault-TxnConfirm', { type: t('ClaimRewards-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.claim(
              network,
              item.earnContractAddress,
              convertAmountToRawNumber(state.rewards, item.earnedTokenDecimals)
            )
          ),
        pending: false,
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    }
  };

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  const handleWalletConnect = () => {
    if (!wallet.address) {
      dispatch(reduxActions.wallet.connect());
    }
  };

  const updateItemData = () => {
    if (wallet.address && item) {
      dispatch(reduxActions.vault.fetchBoosts(item));
      dispatch(reduxActions.balance.fetchBoostBalances(item, network)); // TODO add network
      dispatch(reduxActions.balance.fetchBoostRewards(item, network));
    }
  };

  const resetFormData = () => {
    setFormData({ deposit: { amount: '', max: false }, withdraw: { amount: '', max: false } });
  };

  React.useEffect(() => {
    if (!isEmpty(vault.boosts) && vault.boosts[id]) {
      setItemData(vault.boosts[id]);
    } else {
      history.push('/error');
    }
  }, [vault.boosts, id, history]);

  React.useEffect(() => {
    if (item) {
      setIsLoading(false);
      dispatch(reduxActions.vault.fetchBoosts(item));
    }
  }, [item, dispatch]);

  React.useEffect(() => {
    if (item && wallet.address) {
      dispatch(reduxActions.balance.fetchBoostBalances(item, network)); // TODO add network
      dispatch(reduxActions.balance.fetchBoostRewards(item, network));
    }
  }, [dispatch, item, network, wallet.address]);

  React.useEffect(() => {
    if (item) {
      setInterval(() => {
        dispatch(reduxActions.vault.fetchBoosts(item));
        dispatch(reduxActions.balance.fetchBoostBalances(item, network));
        dispatch(reduxActions.balance.fetchBoostRewards(item, network));
      }, 60000);
    }
  }, [item, dispatch, network]);

  React.useEffect(() => {
    let amount: any = 0;
    let deposited: any = 0;
    let approved: any = 0;
    let poolPercentage: any = 0;
    let rewards: any = 0;

    console.log(balance.tokens[network]);
    console.log(item);
    if (wallet.address && !isEmpty(balance.tokens[network][item.token])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[network][item.token]?.balance),
        item.tokenDecimals
      ).toFixed(8);
      deposited = byDecimals(
        new BigNumber(balance.tokens[network][item.token + item.id + 'Boost']?.balance),
        item.tokenDecimals
      ).toFixed(8);
      approved = balance.tokens[network][item.token].allowance[item.earnContractAddress];

      if (!isEmpty(balance.rewards[item.earnedToken])) {
        rewards = byDecimals(
          new BigNumber(balance.rewards[item.earnedToken].balance),
          item.earnedTokenDecimals
        ).toFixed(8);
      }

      if (deposited > 0) {
        poolPercentage = (
          (Math.floor(new BigNumber(deposited).toNumber() * 1000000000) /
            1000000000 /
            item.staked) *
          100
        ).toFixed(4);
      }
    }
    setState({
      balance: amount,
      deposited: deposited,
      allowance: approved,
      poolPercentage: poolPercentage,
      rewards: rewards,
    });
  }, [wallet.address, item, balance, network]);

  React.useEffect(() => {
    const index = steps.currentStep;
    if (!isEmpty(steps.items[index]) && steps.modal) {
      const items = steps.items;
      if (!items[index].pending) {
        items[index].pending = true;
        items[index].action();
        setSteps({ ...steps, items: items });
      } else {
        if (wallet.action.result === 'success' && !steps.finished) {
          const nextStep = index + 1;
          if (!isEmpty(items[nextStep])) {
            setSteps({ ...steps, currentStep: nextStep });
          } else {
            setSteps({ ...steps, finished: true });
          }
        }
      }
    }
  }, [steps, wallet.action]);

  return (
    <Container className={classes.vaultContainer} maxWidth="lg">
      {isLoading ? (
        <Loader message="Getting boost data..." line={false} />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Button
              className={classes.btnGoBack}
              onClick={() => {
                history.push('/' + network + '/vault/' + item.poolId);
              }}
            >
              <ArrowLeft /> Back to Vault
            </Button>
            <Box className={classes.title} display="flex" alignItems="center">
              <Box>
                <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
              </Box>
              <Box>
                <Typography variant={'h1'}>{item.name} vault</Typography>
              </Box>
              <Box lineHeight={0}>
                <Avatar
                  alt="Fire"
                  src={require('../../images/fire.png').default}
                  imgProps={{
                    style: { objectFit: 'contain' },
                  }}
                />
              </Box>
              <Box>
                <Typography variant={'h2'}>{t('Boost')}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className={classes.summary} display="flex" alignItems="center">
              <Box flexGrow={1} p={2}>
                <Typography variant={'h1'}>{state.balance}</Typography>
                <Typography>{t('Receipt-Balance')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>{formatUsd(item.tvl)}</Typography>
                <Typography>{t('Total-Value-Locked')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>{formatApy(item.apr)}</Typography>
                <Typography>{t('Stake-APR')}</Typography>
              </Box>
              <Box p={2} textAlign={'right'}>
                <Typography variant={'h1'}>{state.poolPercentage}%</Typography>
                <Typography>{t('Your pool %')}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.splitPaper}>
              <Box display={'flex'}>
                <Box className={classes.splitA}>
                  <Typography>
                    {state.deposited} {item.token} <span>$0.00</span>
                  </Typography>
                  <Typography variant={'h2'}>{t('Stake-Staked')}</Typography>
                  <Box textAlign={'center'}>
                    <Button onClick={() => setInputModal(true)} className={classes.btnSubmit}>
                      {t('Stake-Button-Stake')}
                    </Button>
                  </Box>
                </Box>
                <Box className={classes.splitB}>
                  <Typography>
                    {state.rewards} {item.earnedToken}
                  </Typography>
                  <Typography variant={'h2'}>{t('Stake-Rewards')}</Typography>
                  <Box textAlign={'center'}>
                    <Button onClick={handleClaimRewards} className={classes.btnClaim}>
                      {t('Stake-Button-ClaimRewards')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {item.partners.map(partner => (
              <Paper className={classes.partner} key={partner}>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <img
                      alt={partner.name}
                      src={require('../../images/' + partner.logo).default}
                      height="60"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} className={classes.social}>
                    {partner.social.telegram ? (
                      <Link href={partner.social.telegram}>
                        <Telegram /> Telegram
                      </Link>
                    ) : (
                      ''
                    )}
                    {partner.social.twitter ? (
                      <Link href={partner.social.twitter}>
                        <Twitter /> Twitter
                      </Link>
                    ) : (
                      ''
                    )}
                    {partner.website ? (
                      <Link href={partner.website}>
                        <Language /> {partner.website}
                      </Link>
                    ) : (
                      ''
                    )}
                  </Grid>
                  <Grid item xs={12} className={classes.partnerBody}>
                    {partner.text}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>
        </Grid>
      )}

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={inputModal}
        onClose={() => setInputModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={inputModal}>
          <Box className={classes.dw}>
            <Box className={classes.tabs}>
              <Button
                onClick={() => setDw('deposit')}
                className={dw === 'deposit' ? classes.selected : ''}
              >
                {t('Stake-Button-Stake')}
              </Button>
              <Button
                onClick={() => setDw('withdraw')}
                className={dw === 'withdraw' ? classes.selected : ''}
              >
                {t('Stake-Button-Unstake')}
              </Button>
            </Box>
            {dw === 'deposit' ? (
              <Stake
                item={item}
                handleWalletConnect={handleWalletConnect}
                formData={formData}
                setFormData={setFormData}
                updateItemData={updateItemData}
                resetFormData={resetFormData}
              />
            ) : (
              <Unstake
                item={item}
                handleWalletConnect={handleWalletConnect}
                formData={formData}
                setFormData={setFormData}
                updateItemData={updateItemData}
                resetFormData={resetFormData}
              />
            )}
          </Box>
        </Fade>
      </Modal>
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </Container>
  );
};
