import {
  Box,
  Button,
  InputBase,
  makeStyles,
  Paper,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import BigNumber from 'bignumber.js';
import { Loader } from '../../../../components/loader';
import { BIG_ZERO, byDecimals, convertAmountToRawNumber } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { reduxActions } from '../../../redux/actions';
import { Steps } from '../../../../components/Steps';
import { AssetsImage } from '../../../../components/AssetsImage';
import { BoostWidget } from '../BoostWidget';
import { FeeBreakdown } from '../FeeBreakdown';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { DepositProps } from './DepositProps';
import { config } from '../../../../config/config';

const useStyles = makeStyles(styles as any);
export const Deposit: React.FC<DepositProps> = ({
  formData,
  setFormData,
  item,
  handleWalletConnect,
  updateItemData,
  resetFormData,
  isBoosted,
  boostedData,
  vaultBoosts,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { wallet, balance, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
    tokens: state.balanceReducer.tokens[item.network],
  }));
  const t = useTranslation().t;

  const [state, setState] = React.useState({
    balance: BIG_ZERO,
    allowance: BIG_ZERO,
  });
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(
      tokens[formData.deposit.token].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
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
      deposit: {
        ...formData.deposit,
        input: formattedInput,
        amount: value,
        max: max,
      },
    });
  };

  const handleAsset = tokenSymbol => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '',
        amount: BIG_ZERO,
        max: false,
        token: tokenSymbol,
        isZap: item.token !== tokenSymbol,
      },
    });
  };

  const handleMax = () => {
    if (state.balance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: (state.balance as any).significant(6),
          amount: state.balance,
          max: true,
        },
      });
    }
  };

  const handleDeposit = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      const amount = convertAmountToRawNumber(
        formData.deposit.amount,
        tokens[formData.deposit.token].decimals
      );

      const isNative =
        formData.deposit.token === config[item.network].walletSettings.nativeCurrency.symbol;

      if (!isNative && state.allowance.isLessThan(amount)) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: () =>
            dispatch(
              reduxActions.wallet.approval(
                item.network,
                tokens[formData.deposit.token].address,
                formData.deposit.isZap ? formData.zap.address : item.earnContractAddress
              )
            ),
          pending: false,
        });
      }

      if (true === formData.deposit.isZap) {
        const swapAmountOutMin = convertAmountToRawNumber(
          formData.deposit.zapEstimate.amountOut.times(1 - formData.slippageTolerance),
          formData.deposit.zapEstimate.tokenOut.decimals
        );
        steps.push({
          step: 'deposit',
          message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
          action: () =>
            dispatch(
              reduxActions.wallet.beefIn(
                item.network,
                item.earnContractAddress,
                isNative,
                tokens[formData.deposit.token].address,
                amount,
                formData.zap.address,
                swapAmountOutMin
              )
            ),
          token: tokens[formData.deposit.token],
          pending: false,
        });
      }

      if (false === formData.deposit.isZap) {
        if (item.isGovVault) {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.stake(
                  item.network,
                  item.earnContractAddress,
                  convertAmountToRawNumber(formData.deposit.amount, item.tokenDecimals)
                )
              ),
            token: tokens[formData.deposit.token],
            pending: false,
          });
        } else if (isNative) {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.depositNative(item.network, item.earnContractAddress, amount)
              ),
            token: tokens[formData.deposit.token],
            pending: false,
          });
        } else {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.deposit(
                  item.network,
                  item.earnContractAddress,
                  amount,
                  formData.deposit.max
                )
              ),
            token: tokens[formData.deposit.token],
            pending: false,
          });
        }
      }

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleDeposit

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  React.useEffect(() => {
    let amount = BIG_ZERO;
    let approved = BIG_ZERO;
    if (wallet.address && !isEmpty(tokens[formData.deposit.token])) {
      amount = byDecimals(
        new BigNumber(tokens[formData.deposit.token].balance),
        tokens[formData.deposit.token].decimals
      );
      if (formData.zap && formData.deposit.token !== item.token) {
        approved = tokens[formData.deposit.token].allowance[formData.zap.address];
      } else {
        approved = tokens[formData.deposit.token].allowance[item.earnContractAddress];
      }
    }
    setState({
      balance: new BigNumber(amount),
      allowance: new BigNumber(approved),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address, item, balance, formData.deposit.token]);

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
        <Typography className={classes.balanceText}>{t('Vault-Wallet')}</Typography>
        <RadioGroup
          value={formData.deposit.token}
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={e => handleAsset(e.target.value)}
        >
          <div style={{ display: 'flex' }}>
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={item.token}
              control={formData.zap ? <Radio /> : <div style={{ width: 12 }} />}
              label={
                /*TODO: wrap label content into component */
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader message={''} line={true} />
                    ) : (
                      <Typography className={classes.assetCount} variant={'body1'}>
                        {(
                          byDecimals(tokens[item.token].balance, tokens[item.token].decimals) as any
                        ).significant(6)}{' '}
                        {item.token}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
            <Box>
              {item.buyTokenUrl && !item.addLiquidityUrl && (
                <a
                  href={item.buyTokenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={classes.btnSecondary}
                >
                  <Button endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}>
                    {t('Transact-BuyTkn')}
                  </Button>
                </a>
              )}
              {item.addLiquidityUrl && !item.buyTokenUrl && (
                <a
                  href={item.addLiquidityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={classes.btnSecondary}
                >
                  <Button endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}>
                    {t('Transact-AddLiquidity')}
                  </Button>
                </a>
              )}
            </Box>
          </div>
          {formData.zap?.tokens.map(zapToken => (
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={zapToken.symbol}
              control={<Radio />}
              label={
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage
                      {...({
                        assets: [zapToken.symbol],
                        alt: zapToken.name,
                      } as any)}
                    />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader message={''} line={true} />
                    ) : (
                      <Typography className={classes.assetCount} variant={'body1'}>
                        {(
                          byDecimals(tokens[zapToken.symbol].balance, zapToken.decimals) as any
                        ).significant(6)}{' '}
                        {zapToken.symbol}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
          ))}
        </RadioGroup>
        {item.buyTokenUrl && item.addLiquidityUrl && (
          <Box className={classes.btnContaniner}>
            <a
              href={item.buyTokenUrl}
              target="_blank"
              rel="noreferrer"
              className={classes.btnSecondary}
            >
              <Button
                size="small"
                endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
              >
                {t('Transact-BuyTkn')}
              </Button>
            </a>
            <a
              style={{ marginLeft: '12px' }}
              href={item.addLiquidityUrl}
              target="_blank"
              rel="noreferrer"
              className={classes.btnSecondary}
            >
              <Button
                size="small"
                endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
              >
                {t('Transact-AddLiquidity')}
              </Button>
            </a>
          </Box>
        )}
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage
                img={formData.deposit.token === item.token ? item.logo : null}
                assets={
                  formData.deposit.token === item.token ? item.assets : [formData.deposit.token]
                }
                alt={formData.token}
              />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formData.deposit.input}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <FeeBreakdown item={item} formData={formData} type={'deposit'} />
        <Box mt={2}>
          {item.status !== 'active' ? (
            <Button className={classes.btnSubmit} fullWidth={true} disabled={true}>
              {t('Deposit-Disabled')}
            </Button>
          ) : wallet.address ? (
            item.network !== wallet.network ? (
              <Button
                onClick={() => switchNetwork(item.network, dispatch)}
                className={classes.btnSubmit}
                fullWidth={true}
              >
                {t('Network-Change', { network: item.network.toUpperCase() })}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                className={classes.btnSubmit}
                fullWidth={true}
                disabled={
                  formData.deposit.amount.isLessThanOrEqualTo(0) ||
                  formData.deposit.zapEstimate.isLoading
                }
              >
                {formData.deposit.max ? t('Deposit-All') : t('Deposit-Verb')}
              </Button>
            )
          ) : (
            <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>
      {!item.isGovVault ? (
        <BoostWidget boostedData={boostedData} isBoosted={isBoosted} vaultBoosts={vaultBoosts} />
      ) : null}
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  ); //return
}; //const Deposit
