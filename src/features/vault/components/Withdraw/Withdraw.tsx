import makeStyles from '@material-ui/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../../components/loader';
import { byDecimals, convertAmountToRawNumber } from '../../../../helpers/format';
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
  vaultBoosts,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation().t;
  const { wallet, balance, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
    tokens: state.balanceReducer.tokens[item.network],
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

    let value = new BigNumber(input).decimalPlaces(tokens[symbol].decimals, BigNumber.ROUND_DOWN);

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

  const handleWithdrawOptions = (event, tokenSymbol) => {
    if (!tokenSymbol) return false;
    const isZapSwap = formData.zap.tokens.some(t => t.symbol === tokenSymbol);
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        withdraw: {
          ...prevFormData.withdraw,
          token: tokenSymbol,
          isZap: item.token !== tokenSymbol,
          isZapSwap: isZapSwap,
          zapEstimate: {
            ...prevFormData.withdraw.zapEstimate,
            isLoading: isZapSwap,
          },
        },
      };
    });
  };

  React.useEffect(() => {
    if (formData.withdraw.isZapSwap) {
      reduxActions.vault.estimateZapWithdraw({
        web3: wallet.rpc,
        vault: item,
        formData,
        setFormData,
      });
    }
    // eslint-disable-next-line
  }, [
    formData.withdraw.amount,
    formData.withdraw.isZapSwap,
    formData.withdraw.token,
    wallet.rpc,
    item,
  ]);

  const handleWithdraw = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      const isNative = item.token === config[item.network].walletSettings.nativeCurrency.symbol;

      if (item.isGovVault) {
        steps.push({
          step: 'withdraw',
          message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
          action: () =>
            dispatch(
              reduxActions.wallet.unstake(
                item.network,
                item.earnContractAddress,
                convertAmountToRawNumber(formData.withdraw.amount, item.tokenDecimals)
              )
            ),
          pending: false,
          token: tokens[item.token],
        });
      } else {
        let shares = formData.withdraw.amount
          .dividedBy(byDecimals(item.pricePerFullShare))
          .decimalPlaces(item.tokenDecimals, BigNumber.ROUND_DOWN);
        const sharesBalance = byDecimals(tokens[item.earnedToken].balance);

        if (shares.times(100).dividedBy(sharesBalance).isGreaterThan(99)) {
          shares = sharesBalance;
          formData.withdraw.max = true;
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

        const rawShares = convertAmountToRawNumber(shares);

        if (formData.withdraw.isZap) {
          const approved = new BigNumber(tokens[item.earnedToken].allowance[formData.zap.address]);
          if (approved.isLessThan(rawShares)) {
            steps.push({
              step: 'approve',
              message: t('Vault-ApproveMsg'),
              action: () =>
                dispatch(
                  reduxActions.wallet.approval(
                    item.network,
                    tokens[item.earnedToken].address,
                    formData.zap.address
                  )
                ),
              pending: false,
            });
          }

          let swapAmountOutMin;
          if (formData.withdraw.isZapSwap) {
            swapAmountOutMin = convertAmountToRawNumber(
              formData.withdraw.zapEstimate.amountOut.times(1 - formData.slippageTolerance),
              formData.withdraw.zapEstimate.tokenOut.decimals
            );
          }

          steps.push({
            step: 'withdraw',
            message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
            action: () =>
              formData.withdraw.isZapSwap
                ? dispatch(
                    reduxActions.wallet.beefOutAndSwap(
                      item.network,
                      item.earnContractAddress,
                      rawShares,
                      formData.zap.address,
                      formData.withdraw.zapEstimate.tokenOut.address,
                      swapAmountOutMin
                    )
                  )
                : dispatch(
                    reduxActions.wallet.beefOut(
                      item.network,
                      item.earnContractAddress,
                      rawShares,
                      formData.zap.address
                    )
                  ),
            pending: false,
            token: tokens[item.token],
          });
        } else {
          steps.push({
            step: 'withdraw',
            message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
            action: () =>
              isNative
                ? dispatch(
                    reduxActions.wallet.withdrawNative(
                      item.network,
                      item.earnContractAddress,
                      rawShares,
                      formData.withdraw.max
                    )
                  )
                : dispatch(
                    reduxActions.wallet.withdraw(
                      item.network,
                      item.earnContractAddress,
                      rawShares,
                      formData.withdraw.max
                    )
                  ),
            pending: false,
            token: tokens[item.token],
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
        step: 'claim',
        message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.claim(
              item.network,
              item.earnContractAddress,
              state.balance.toNumber()
            )
          ),
        pending: false,
        token: tokens[item.token],
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
        step: 'claim-withdraw',
        message: t('Vault-TxnConfirm', { type: t('Claim-Withdraw-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.exit(
              item.network,
              item.earnContractAddress,
              state.balance.toNumber()
            )
          ),
        pending: false,
        token: tokens[item.token],
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
      if (wallet.address && !isEmpty(tokens[symbol])) {
        amount = byDecimals(new BigNumber(tokens[symbol].balance), item.tokenDecimals);
      }
    } else {
      if (wallet.address && !isEmpty(tokens[item.earnedToken])) {
        amount = byDecimals(
          new BigNumber(tokens[item.earnedToken].balance).multipliedBy(
            byDecimals(item.pricePerFullShare)
          ),
          item.tokenDecimals
        );
      }
    }
    setState({ balance: amount });
  }, [wallet.address, item, tokens]);

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
        {formData.zap && (
          <Typography variant="body1" className={classes.zapPromotion}>
            {t('Zap-Promotion', {
              action: 'Withdraw',
              token1: item.assets[0],
              token2: item.assets[1],
            })}
          </Typography>
        )}
        <Typography className={classes.balanceText}>{t('Vault-Deposited')}</Typography>
        <RadioGroup
          value={formData.withdraw.token}
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={handleWithdrawOptions}
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
                        {!formData.zap && (state.balance as any).significant(6)} {item.token}
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
          {formData.zap && (
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={item.assets.join('+')}
              control={<Radio />}
              label={
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage img={item.logo} assets={item.assets} alt={item.assets.join('+')} />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader message={''} line={true} />
                    ) : (
                      <Typography className={classes.assetCount} variant={'body1'}>
                        {item.assets.join('+')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
          )}
          {formData.zap?.tokens.map(
            zapToken =>
              !zapToken.isWrapped && (
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
                            {zapToken.symbol}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              )
          )}
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
                    disabled={
                      formData.withdraw.amount.isLessThanOrEqualTo(0) ||
                      formData.withdraw.zapEstimate.isLoading
                    }
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
      {!item.isGovVault ? (
        <BoostWidget boostedData={boostedData} isBoosted={isBoosted} vaultBoosts={vaultBoosts} />
      ) : null}
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  ); //return
}; //const Withdraw
