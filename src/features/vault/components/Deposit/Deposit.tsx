import {
  Box,
  Button,
  FormControlLabel,
  InputBase,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { useStepper } from '../../../../components/Steps/hooks';
import { Step } from '../../../../components/Steps/types';
import { BeefyState } from '../../../../redux-types';
import { initDepositForm } from '../../../data/actions/scenarios';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { walletActions } from '../../../data/actions/wallet-actions';
import { isTokenNative, TokenEntity } from '../../../data/entities/token';
import { isGovVault, isStandardVault, VaultEntity } from '../../../data/entities/vault';
import { isFulfilled } from '../../../data/reducers/data-loader';
import { depositActions } from '../../../data/reducers/wallet/deposit';
import { selectShouldDisplayBoostWidget } from '../../../data/selectors/boosts';
import { selectChainById } from '../../../data/selectors/chains';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { selectChainNativeToken, selectTokenById } from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../data/selectors/wallet';
import { selectIsApprovalNeededForDeposit } from '../../../data/selectors/wallet-actions';
import { BoostWidget } from '../BoostWidget';
import { FeeBreakdown } from '../FeeBreakdown';
import { styles } from '../styles';
import { TokenWithBalance } from '../TokenWithBalance';
import { VaultBuyLinks, VaultBuyLinks2 } from '../VaultBuyLinks';

const useStyles = makeStyles(styles as any);

export const Deposit = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const store = useStore();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );

  const walletAddress = useSelector((state: BeefyState) =>
    isWalletConnected ? selectWalletAddress(state) : null
  );

  // initialize form data
  React.useEffect(() => {
    // init form on mount
    initDepositForm(store, vaultId, walletAddress);
    // reset form on unmount
    return () => {
      store.dispatch(depositActions.resetForm());
    };
  }, [store, vaultId, walletAddress]);

  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );
  const formState = useSelector((state: BeefyState) => state.ui.deposit);
  const native = useSelector((state: BeefyState) => selectChainNativeToken(state, vault.chainId));
  const displayBoostWidget = useSelector((state: BeefyState) =>
    selectShouldDisplayBoostWidget(state, vaultId)
  );

  // if it's a zap, we spend with the zap contract
  const spenderAddress = formState.isZap
    ? formState.zapOptions?.address || null
    : // if it's a classic vault, the vault contract address is the spender
    // which is also the earned token
    isStandardVault(vault)
    ? vault.contractAddress
    : vault.earnContractAddress;

  const needsApproval = useSelector((state: BeefyState) =>
    formState.selectedToken && formState.selectedToken.id !== native.id && spenderAddress
      ? selectIsApprovalNeededForDeposit(state, spenderAddress)
      : false
  );

  const formDataLoaded = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, vault.chainId) &&
      isFulfilled(state.ui.dataLoader.global.depositForm)
  );
  const isZapEstimateLoading = formState.isZap && !formState.zapEstimate;

  const [startStepper, isStepping, Stepper] = useStepper(vaultId);

  const formReady = formDataLoaded && !isStepping && !isZapEstimateLoading;

  const handleAsset = (tokenId: TokenEntity['id']) => {
    dispatch(depositActions.setAsset({ tokenId, state: store.getState() }));
  };

  const handleInput = (amountStr: string) => {
    dispatch(depositActions.setInput({ amount: amountStr, state: store.getState() }));
  };

  const handleMax = () => {
    dispatch(depositActions.setMax({ state: store.getState() }));
  };

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
          <Typography variant="body1" className={classes.zapPromotion}>
            {t('Zap-Promotion', {
              action: 'Deposit',
              token1: vault.assetIds[0],
              token2: vault.assetIds[1],
            })}
          </Typography>
        )}

        <Typography className={classes.balanceText}>{t('Vault-Wallet')}</Typography>
        <RadioGroup
          value={formState.selectedToken ? formState.selectedToken.id : ''}
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={e => handleAsset(e.target.value)}
        >
          <div style={{ display: 'flex' }}>
            <FormControlLabel
              className={classes.depositTokenContainer}
              value={oracleToken.id}
              control={formState.zapOptions !== null ? <Radio /> : <div style={{ width: 12 }} />}
              label={<TokenWithBalance token={oracleToken} vaultId={vaultId} />}
              onClick={formState.isZap ? undefined : handleMax}
              disabled={!formReady}
            />
            <VaultBuyLinks vaultId={vaultId} />
          </div>
          {formState.zapOptions?.tokens.map(zapToken => (
            <FormControlLabel
              key={zapToken.id}
              className={classes.depositTokenContainer}
              value={zapToken.id}
              control={<Radio />}
              label={<TokenWithBalance token={zapToken} vaultId={vaultId} />}
              disabled={!formReady}
            />
          ))}
        </RadioGroup>
        <VaultBuyLinks2 vaultId={vaultId} />
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage
                img={
                  formState.selectedToken && formState.selectedToken.id === vault.oracleId
                    ? vault.logoUri
                    : null
                }
                assets={
                  !formState.selectedToken
                    ? vault.assetIds
                    : formState.selectedToken.id === vault.oracleId
                    ? vault.assetIds
                    : [formState.selectedToken.id]
                }
                alt={formState.selectedToken ? formState.selectedToken.symbol : ''}
              />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formState.formattedInput}
              onChange={e => handleInput(e.target.value)}
              disabled={!formReady}
            />
            <Button onClick={handleMax} disabled={!formReady}>
              {t('Transact-Max')}
            </Button>
          </Paper>
        </Box>
        <FeeBreakdown
          vault={vault}
          slippageTolerance={formState.slippageTolerance}
          zapEstimate={formState.zapEstimate}
          isZapSwap={false}
          isZap={formState.isZap}
          type={'deposit'}
        />
        <Box mt={2}>
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
                disabled={formState.amount.isLessThanOrEqualTo(0) || !formReady}
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
