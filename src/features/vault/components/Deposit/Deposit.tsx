import {
  Box,
  Button,
  FormControlLabel,
  InputBase,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import React, { ChangeEventHandler, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage';
import { useStepper } from '../../../../components/Steps/hooks';
import { Step } from '../../../../components/Steps/types';
import { initDepositForm } from '../../../data/actions/scenarios';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { walletActions } from '../../../data/actions/wallet-actions';
import { isTokenNative } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { depositActions } from '../../../data/reducers/wallet/deposit';
import { selectShouldDisplayBoostWidget } from '../../../data/selectors/boosts';
import { selectChainById } from '../../../data/selectors/chains';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { selectChainNativeToken, selectTokenByAddress } from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../data/selectors/wallet';
import { selectIsApprovalNeededForDeposit } from '../../../data/selectors/wallet-actions';
import { BoostWidget } from '../BoostWidget';
import { ZapBreakdown } from '../ZapBreakdown';
import { styles } from '../styles';
import { TokenWithBalance } from '../TokenWithBalance';
import { VaultBuyLinks } from '../VaultBuyLinks';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../store';
import { MaxNativeDepositAlert } from '../MaxNativeDepositAlert';
import { ZapPriceImpact, ZapPriceImpactProps } from '../ZapPriceImpactNotice';
import { isFulfilled } from '../../../data/reducers/data-loader-types';
import { FeeBreakdown } from '../FeeBreakdown';

const useStyles = makeStyles(styles);

export const Deposit = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const store = useAppStore();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );
  const walletAddress = useAppSelector(state =>
    isWalletConnected ? selectWalletAddress(state) : null
  );
  const [priceImpactDisableDeposit, setPriceImpactDisableDeposit] = useState(false);

  // initialize form data
  React.useEffect(() => {
    // init form on mount
    initDepositForm(store, vaultId, walletAddress);
    // reset form on unmount
    return () => {
      store.dispatch(depositActions.resetForm());
    };
  }, [store, vaultId, walletAddress]);

  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const formState = useAppSelector(state => state.ui.deposit);
  const native = useAppSelector(state => selectChainNativeToken(state, vault.chainId));
  const displayBoostWidget = useAppSelector(state =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );

  // if it's a zap, we spend with the zap contract
  const spenderAddress = formState.isZap
    ? formState.zapOptions?.address || null
    : // if it's a classic vault, the vault contract address is the spender
      // which is also the earned token
      vault.earnContractAddress;

  const needsApproval = useAppSelector(state =>
    formState.selectedToken && formState.selectedToken.id !== native.id && spenderAddress
      ? selectIsApprovalNeededForDeposit(state, spenderAddress)
      : false
  );

  const formDataLoaded = useAppSelector(
    state =>
      selectIsAddressBookLoaded(state, vault.chainId) &&
      isFulfilled(state.ui.dataLoader.global.depositForm)
  );
  const isZapEstimateLoading = formState.isZap && !formState.zapEstimate;

  const [startStepper, isStepping, Stepper] = useStepper(chain.id);

  const formReady = formDataLoaded && !isStepping && !isZapEstimateLoading;

  const isDepositButtonDisabled =
    formState.amount.isLessThanOrEqualTo(0) ||
    !formReady ||
    (formState.max && formState.selectedToken.type === 'native') ||
    priceImpactDisableDeposit;

  const handleAsset = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      dispatch(depositActions.setAsset({ tokenId: e.target.value, state: store.getState() }));
    },
    [dispatch, store]
  );

  const handleInput = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      dispatch(depositActions.setInput({ amount: e.target.value, state: store.getState() }));
    },
    [dispatch, store]
  );

  const handleMax = useCallback(() => {
    dispatch(depositActions.setMax({ state: store.getState() }));
  }, [dispatch, store]);

  const handlePriceImpactConfirm = useCallback<ZapPriceImpactProps['onChange']>(
    shouldDisable => {
      setPriceImpactDisableDeposit(shouldDisable);
    },
    [setPriceImpactDisableDeposit]
  );

  const handleDeposit = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (!isTokenNative(formState.selectedToken) && needsApproval) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(formState.selectedToken, spenderAddress),
        pending: false,
      });
    }

    if (formState.isZap) {
      steps.push({
        step: 'deposit',
        message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
        action: walletActions.beefIn(
          vault,
          formState.amount,
          formState.zapOptions,
          formState.zapEstimate,
          formState.slippageTolerance
        ),
        pending: false,
      });
    } else {
      if (isGovVault(vault)) {
        steps.push({
          step: 'deposit',
          message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
          action: walletActions.stakeGovVault(vault, formState.amount),
          pending: false,
        });
      } else {
        steps.push({
          step: 'deposit',
          message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
          action: walletActions.deposit(vault, formState.amount, formState.max),
          pending: false,
        });
      }
    }

    startStepper(steps);
  };

  return (
    <>
      <Box p={3}>
        {formState.zapOptions !== null && (
          <div className={classes.zapPromotion}>
            {t('Zap-InPromotion', {
              action: 'Deposit',
              token1: vault.assetIds[0],
              token2: vault.assetIds[1],
            })}
          </div>
        )}

        <Box mb={1} className={classes.balanceText}>
          {t('Vault-Wallet')}
        </Box>
        <RadioGroup
          className={classes.radioGroup}
          value={formState.selectedToken ? formState.selectedToken.id : ''}
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={handleAsset}
        >
          <FormControlLabel
            className={classes.depositTokenContainer}
            value={depositToken.id}
            control={formState.zapOptions !== null ? <Radio /> : <div style={{ width: 12 }} />}
            label={<TokenWithBalance token={depositToken} vaultId={vaultId} />}
            onClick={formState.isZap ? undefined : handleMax}
            disabled={!formReady}
          />
          {formState.zapOptions?.tokens.map(zapToken => (
            <FormControlLabel
              key={zapToken.id}
              className={classes.depositTokenContainer}
              value={zapToken.id}
              control={<Radio />}
              label={<TokenWithBalance token={zapToken} vaultId={vaultId} variant="sm" />}
              disabled={!formReady}
            />
          ))}
        </RadioGroup>
        <VaultBuyLinks vaultId={vaultId} />
        <Box className={classes.inputContainer}>
          <Paper component="form">
            <Box className={classes.inputLogo}>
              <AssetsImage
                chainId={vault.chainId}
                assetIds={
                  !formState.selectedToken
                    ? vault.assetIds
                    : formState.selectedToken.address === depositToken.address
                    ? vault.assetIds
                    : [formState.selectedToken.id]
                }
                size={24}
              />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formState.formattedInput}
              onChange={handleInput}
              disabled={!formReady}
            />
            <Button onClick={handleMax} disabled={!formReady}>
              {t('Transact-Max')}
            </Button>
          </Paper>
        </Box>
        {formState.isZap ? (
          <>
            <ZapBreakdown
              vault={vault}
              slippageTolerance={formState.slippageTolerance}
              zapEstimate={formState.zapEstimate}
              zapError={formState.zapError}
              isZapSwap={false}
              isZap={formState.isZap}
              type={'deposit'}
            />
            <ZapPriceImpact mode={'deposit'} onChange={handlePriceImpactConfirm} />
          </>
        ) : null}
        <FeeBreakdown vaultId={vaultId} />
        <MaxNativeDepositAlert />
        <Box mt={3}>
          {vault.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
          {vault.status !== 'active' ? (
            <Button className={classes.btnSubmit} fullWidth={true} disabled={true}>
              {t('Deposit-Disabled')}
            </Button>
          ) : isWalletConnected ? (
            !isWalletOnVaultChain ? (
              <Button
                onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
                className={classes.btnSubmit}
                fullWidth={true}
              >
                {t('Network-Change', { network: chain.name.toUpperCase() })}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                className={classes.btnSubmit}
                fullWidth={true}
                disabled={isDepositButtonDisabled}
              >
                {isZapEstimateLoading
                  ? t('Zap-Estimating')
                  : formState.max
                  ? t('Deposit-All')
                  : t('Deposit-Verb')}
              </Button>
            )
          ) : (
            <Button
              className={classes.btnSubmit}
              fullWidth={true}
              onClick={() => dispatch(askForWalletConnection())}
            >
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>

      {displayBoostWidget && <BoostWidget vaultId={vaultId} />}
      <Stepper />
    </>
  );
};
