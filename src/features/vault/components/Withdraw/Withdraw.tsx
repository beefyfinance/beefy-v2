import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../../components/loader';
import {
  byDecimals,
  convertAmountToRawNumber,
} from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { AssetsImage } from '../../../../components/AssetsImage';
import { reduxActions } from '../../../redux/actions';
import { BoostWidget } from '../BoostWidget';
import { FeeBreakdown } from '../FeeBreakdown';
import { Steps } from '../../../../components/Steps';
import { styles } from '../styles';
import BigNumber from 'bignumber.js';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { config } from '../../../../config/config';

const useStyles = makeStyles(styles as any);
export const Withdraw = ({
  item,
  handleWalletConnect,
  formData,
  setFormData,
  updateItemData,
  resetFormData,
  isBoosted,
  boostedData,
  vaultBoosts
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation().t;
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const [state, setState] = React.useState({ balance: new BigNumber(0) });
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let symbol = item.isGovVault ? `${item.token}GovVault` : item.earnedToken;

    let max = false;

    let value = new BigNumber(input).decimalPlaces(
      balance.tokens[item.network][symbol].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = new BigNumber(0);
    }

    if (value.isGreaterThanOrEqualTo(state.balance)) {
      value = state.balance;
      max = true;
    }

    const formattedInput = (() => {
      if (value.isEqualTo(input)) return input;
      if (input === '') return '';
      if (input === '.') return `0.`;
      return (value as any).significant(6);
    })();

    setFormData({
      ...formData,
      withdraw: {
        ...formData.withdraw,
        input: formattedInput,
        amount: value,
        max: max,
      },
    });
  };

  const handleMax = () => {
    if (state.balance.toNumber() > 0) {
      setFormData({
        ...formData,
        withdraw: {
          ...formData.withdraw,
          input: (state.balance as any).significant(6),
          amount: state.balance,
          max: true,
        },
      });
    }
  };

  const handleWithdraw = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      const isNative = item.token === config[item.network].walletSettings.nativeCurrency.symbol;

      // const amount = new BigNumber(formData.withdraw.amount)
      //   .dividedBy(byDecimals(item.pricePerFullShare, item.tokenDecimals))
      //   .toFixed(8);

      if (item.isGovVault) {
        steps.push({
          step: 'withdraw',
          message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
          action: () =>
            dispatch(
              reduxActions.wallet.unstake(
                item.network,
                item.earnContractAddress,
                convertAmountToRawNumber(formData.withdraw.amount, item.tokenDecimals)
              )
            ),
          pending: false,
          token: balance.tokens[item.network][item.token],
        });
      } else {
        const shares = formData.withdraw.amount.dividedBy(byDecimals(item.pricePerFullShare,18)).decimalPlaces(item.tokenDecimals, BigNumber.ROUND_UP);
        const sharesByDecimals = byDecimals(state.balance, item.tokenDecimals);
        if (shares.times(100).dividedBy(sharesByDecimals).isGreaterThan(99)) {
          setFormData({
            ...formData,
            withdraw: {
              ...formData.withdraw,
              input: (state.balance as any).significant(6),
              amount: state.balance.toNumber(),
              max: true,
            },
          });
        }
        if (isNative) {
          steps.push({
            step: 'withdraw',
            message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.withdrawNative(
                  item.network,
                  item.earnContractAddress,
                  convertAmountToRawNumber(shares, item.tokenDecimals),
                  formData.withdraw.max
                )
              ),
            pending: false,
            token: balance.tokens[item.network][item.token],
          });

        } else {
          steps.push({
            step: 'withdraw',
            message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.withdraw(
                  item.network,
                  item.earnContractAddress,
                  // convertAmountToRawNumber(formData.withdraw.amount, item.tokenDecimals),
                  convertAmountToRawNumber(shares, item.tokenDecimals),
                  formData.withdraw.max
                )
              ),
            pending: false,
            token: balance.tokens[item.network][item.token],
          });
        }

      } 

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleWithdraw

  const handleClaim = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      steps.push({
        step: 'withdraw',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.claim(
              item.network,
              item.earnContractAddress,
              state.balance.toNumber()
            )
          ),
        pending: false,
        token: balance.tokens[item.network][item.token],
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleWithdraw

  const handleExit = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      steps.push({
        step: 'withdraw',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.exit(
              item.network,
              item.earnContractAddress,
              state.balance.toNumber()
            )
          ),
        pending: false,
        token: balance.tokens[item.network][item.token],
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleWithdraw

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  React.useEffect(() => {
    let amount = new BigNumber(0);

    if (item.isGovVault) {
      let symbol = `${item.token}GovVault`;
      if (wallet.address && !isEmpty(balance.tokens[item.network][symbol])) {
        amount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].balance),
          item.tokenDecimals
        );
      }
    } else {
      if (wallet.address && !isEmpty(balance.tokens[item.network][item.earnedToken])) {
        amount = byDecimals(
          new BigNumber(balance.tokens[item.network][item.earnedToken].balance).multipliedBy(
            byDecimals(item.pricePerFullShare)
          ),
          item.tokenDecimals
        );
      }
    }
    setState({ balance: amount });
  }, [wallet.address, item, balance]);

  React.useEffect(() => {
    setIsLoading(balance.isBalancesLoading);
  }, [balance.isBalancesLoading]);

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
    <React.Fragment>
      <Box p={3}>
        <Typography className={classes.balanceText}>{t('Vault-Deposited')}</Typography>
        <Box className={classes.balanceContainer} display="flex" alignItems="center">
          <Box lineHeight={0}>
            <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
          </Box>
          <Box flexGrow={1} pl={1} lineHeight={0}>
            {isLoading ? (
              <Loader line={true} />
            ) : (
              <Typography variant={'body1'}>
                {(state.balance as any).significant(6)} {item.token}
              </Typography>
            )}
          </Box>
          <Box>
            <a
              href={item.buyTokenUrl}
              target="_blank"
              rel="noreferrer"
              className={classes.btnSecondary}
            >
              <Button endIcon={<OpenInNewRoundedIcon />}>{t('Transact-BuyTkn')}</Button>
            </a>
          </Box>
        </Box>
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formData.withdraw.input}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <FeeBreakdown item={item} formData={formData} type={'withdraw'} />
        <Box mt={2}>
          {wallet.address ? (
            item.network !== wallet.network ? (
              <>
                <Button
                  onClick={() => switchNetwork(item.network, dispatch)}
                  className={classes.btnSubmit}
                  fullWidth={true}
                >
                  {t('Network-Change', { network: item.network.toUpperCase() })}
                </Button>
              </>
            ) : (
              <>
                {item.isGovVault ? (
                  <>
                    <Button
                      onClick={handleClaim}
                      disabled={state.balance.toNumber() <= 0}
                      className={classes.btnSubmit}
                      fullWidth={true}
                    >
                      {t('ClaimRewards-noun')}
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      className={classes.btnSubmitSecondary}
                      fullWidth={true}
                      disabled={formData.withdraw.amount <= 0}
                    >
                      {formData.withdraw.max ? t('Withdraw-All') : t('Withdraw-Verb')}
                    </Button>
                    <Button
                      onClick={handleExit}
                      disabled={state.balance.toNumber() <= 0}
                      className={classes.btnSubmitSecondary}
                      fullWidth={true}
                    >
                      {t('Claim-And-Withdraw')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleWithdraw}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={formData.withdraw.amount <= 0}
                  >
                    {formData.withdraw.max ? t('Withdraw-All') : t('Withdraw-Verb')}
                  </Button>
                )}
              </>
            )
          ) : (
            <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>
      {!item.isGovVault ? <BoostWidget boostedData={boostedData} isBoosted={isBoosted} vaultBoosts={vaultBoosts} /> : null}
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  ); //return
}; //const Withdraw
