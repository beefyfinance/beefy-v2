import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import type { ButtonVariantProps } from '../../../../../../components/Button/styles.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';

type ActionButtonProps = ButtonVariantProps;

export const ActionConnect = memo(function ActionConnect(props: ActionButtonProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(selectIsStepperStepping);
  const handleClick = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  return (
    <Button
      {...props}
      variant="cta"
      fullWidth={props.fullWidth !== undefined ? props.fullWidth : true}
      borderless={props.fullWidth !== undefined ? props.borderless : true}
      onClick={handleClick}
      disabled={isStepping}
    >
      {t('Network-ConnectWallet')}
    </Button>
  );
});

export type ActionSwitchProps = {
  chainId: ChainEntity['id'];
} & ActionButtonProps;
export const ActionSwitch = memo(function ActionSwitch({ chainId, ...props }: ActionSwitchProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(selectIsStepperStepping);
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => {
    dispatch(askForNetworkChange({ chainId }));
  }, [dispatch, chainId]);

  return (
    <Button
      {...props}
      variant="cta"
      fullWidth={props.fullWidth !== undefined ? props.fullWidth : true}
      borderless={props.fullWidth !== undefined ? props.borderless : true}
      onClick={handleClick}
      disabled={isStepping}
    >
      {t('Network-Change', { network: chain.name })}
    </Button>
  );
});

export type ActionConnectSwitchProps = {
  chainId?: ChainEntity['id'];
  children: ReactNode;
};

export const ActionConnectSwitch = memo(function ActionConnectSwitch({
  children,
  chainId,
}: ActionConnectSwitchProps) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return <ActionConnect />;
  }

  if (chainId && chainId !== connectedChainId) {
    return <ActionSwitch chainId={chainId} />;
  }

  return children;
});
