import React from 'react';
import { avatarsAddress, mintPrice } from '../../constants';
import { Step } from '../../../../components/Steps/types';
import { useStepper } from '../../../../components/Steps/hooks';
import { useTranslation } from 'react-i18next';
import { Button, makeStyles } from '@material-ui/core';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { useSelector, useDispatch } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../data/selectors/wallet';
import { walletActions } from '../../../data/actions/wallet-actions';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

const MintButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyles();
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === 'polygon'
  );
  const [startStepper, isStepping, Stepper] = useStepper();

  const handleMint = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: 'polygon' }));
    }

    steps.push({
      step: 'mint',
      message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
      action: walletActions.mintNft(avatarsAddress, mintPrice),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <>
      <Button disabled={isStepping} className={classes.btnMint} onClick={handleMint}>
        {t('Avatars-Btn-Mint')}
      </Button>
      ;
      <Stepper />
    </>
  );
};

export { MintButton };
