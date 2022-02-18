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
import { Steps } from '../../../../components/Steps';
import { AssetsImage } from '../../../../components/AssetsImage';
import { BoostWidget } from '../BoostWidget';
import { FeeBreakdown } from '../FeeBreakdown';
import { config } from '../../../../config/config';
import { askForNetworkChange } from '../../../data/actions/wallet';
import { reduxActions } from '../../../redux/actions';
import { BeefyState } from '../../../../redux-types';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsWalletConnected } from '../../../data/selectors/wallet';
import { selectVaultById } from '../../../data/selectors/vaults';
import { initiateDepositForm } from '../../../data/actions/deposit';
import { isFulfilled } from '../../../data/reducers/data-loader';

const useStyles = makeStyles(styles as any);

export const Deposit = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const addressBookLoaded = useSelector(
    (state: BeefyState) =>
      state.ui.dataLoader.byChainId[vault.chainId]?.addressBook.alreadyLoadedOnce || false
  );
  const formReady = useSelector((state: BeefyState) =>
    isFulfilled(state.ui.dataLoader.global.depositForm)
  );

  // initialize our form
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (addressBookLoaded) {
      dispatch(initiateDepositForm({ vaultId }));
    }
  }, [addressBookLoaded, dispatch, vaultId]);

  return addressBookLoaded && formReady ? <DepositForm vaultId={vaultId} /> : <Loader />;
};

const DepositForm = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  /*
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const isLoading = useSelector((state: BeefyState) => selectIsUserBalanceAvailable(state));
*/
  React.useEffect(() => {
    let amount = BIG_ZERO;
    let approved = BIG_ZERO;
    if (isWalletConnected && !isEmpty(tokens[formData.deposit.token])) {
      amount = formTokenBalance;
      if (formData.zap && formData.deposit.token !== vault.token) {
        approved = tokens[formData.deposit.token].allowance[formData.zap.address];
      } else {
        approved = tokens[formData.deposit.token].allowance[vault.earnContractAddress];
      }
    }
    setState({
      balance: new BigNumber(amount),
      allowance: new BigNumber(approved),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address, vault, formData.deposit.token]);

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
        isZap: vault.token !== tokenSymbol,
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
      if (vault.network !== wallet.network) {
        dispatch(askForNetworkChange({ chainId: vault.chainId }));
        return false;
      }

      const amount = convertAmountToRawNumber(
        formData.deposit.amount,
        tokens[formData.deposit.token].decimals
      );

      const isNative =
        formData.deposit.token === config[vault.network].walletSettings.nativeCurrency.symbol;

      if (!isNative && state.allowance.isLessThan(amount)) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: () =>
            dispatch(
              reduxActions.wallet.approval(
                vault.network,
                tokens[formData.deposit.token].address,
                formData.deposit.isZap ? formData.zap.address : vault.earnContractAddress
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
                vault.network,
                vault.earnContractAddress,
                isNative,
                tokens[formData.deposit.token].address,
                amount,
                formData.zap.address,
                swapAmountOutMin
              )
            ),
          token: tokens[formData.deposit.token],
          pending: false,
          amount,
        });
      }

      if (false === formData.deposit.isZap) {
        if (vault.isGovVault) {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.stake(
                  vault.network,
                  vault.earnContractAddress,
                  convertAmountToRawNumber(formData.deposit.amount, vault.tokenDecimals)
                )
              ),
            token: tokens[formData.deposit.token],
            pending: false,
            amount: amount,
          });
        } else if (isNative) {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.depositNative(vault.network, vault.earnContractAddress, amount)
              ),
            token: tokens[formData.deposit.token],
            pending: false,
            amount: amount,
          });
        } else {
          steps.push({
            step: 'deposit',
            message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
            action: () =>
              dispatch(
                reduxActions.wallet.deposit(
                  vault.network,
                  vault.earnContractAddress,
                  amount,
                  formData.deposit.max
                )
              ),
            token: tokens[formData.deposit.token],
            pending: false,
            amount: amount,
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
              action: 'Deposit',
              token1: vault.assets[0],
              token2: vault.assets[1],
            })}
          </Typography>
        )}

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
              value={vault.token}
              control={formData.zap ? <Radio /> : <div style={{ width: 12 }} />}
              label={
                /*TODO: wrap label content into component */
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage img={vault.logo} assets={vault.assets} alt={vault.name} />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader message={''} line={true} />
                    ) : (
                      <Typography className={classes.assetCount} variant={'body1'}>
                        {(
                          byDecimals(
                            tokens[vault.token].balance,
                            tokens[vault.token].decimals
                          ) as any
                        ).significant(6)}{' '}
                        {vault.token}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
            <Box>
              {vault.buyTokenUrl && !vault.addLiquidityUrl && (
                <a
                  href={vault.buyTokenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={classes.btnSecondary}
                >
                  <Button endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}>
                    {t('Transact-BuyTkn')}
                  </Button>
                </a>
              )}
              {vault.addLiquidityUrl && !vault.buyTokenUrl && (
                <a
                  href={vault.addLiquidityUrl}
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
        {vault.buyTokenUrl && vault.addLiquidityUrl && (
          <Box className={classes.btnContaniner}>
            <a
              href={vault.buyTokenUrl}
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
              href={vault.addLiquidityUrl}
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
                img={formData.deposit.token === vault.token ? vault.logo : null}
                assets={
                  formData.deposit.token === vault.token ? vault.assets : [formData.deposit.token]
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
        <FeeBreakdown
          item={vault}
          slippageTolerance={formData.slippageTolerance}
          zapEstimate={formData.deposit.zapEstimate}
          isZapSwap={formData.deposit.isZapSwap}
          isZap={formData.deposit.isZap}
          type={'deposit'}
        />
        <Box mt={2}>
          {vault.status !== 'active' ? (
            <Button className={classes.btnSubmit} fullWidth={true} disabled={true}>
              {t('Deposit-Disabled')}
            </Button>
          ) : wallet.address ? (
            vault.network !== wallet.network ? (
              <Button
                onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
                className={classes.btnSubmit}
                fullWidth={true}
              >
                {t('Network-Change', { network: vault.network.toUpperCase() })}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                className={classes.btnSubmit}
                fullWidth={true}
                disabled={
                  formData.deposit.amount.isLessThanOrEqualTo(0) ||
                  (formData.deposit.isZap && formData.deposit.zapEstimate.isLoading)
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
      {!vault.isGovVault ? (
        <BoostWidget boostedData={boostedData} isBoosted={isBoosted} vaultBoosts={vaultBoosts} />
      ) : null}
      <Steps item={vault} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  ); //return
}; //const Deposit
