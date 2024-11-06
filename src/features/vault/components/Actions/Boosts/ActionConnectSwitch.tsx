import type { ChainEntity } from '../../../../data/entities/chain';
import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import { selectIsStepperStepping } from '../../../../data/selectors/stepper';
import { selectChainById } from '../../../../data/selectors/chains';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet';
import { Button } from '../../../../../components/Button';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../../data/selectors/wallet';

type ActionButtonProps = {
  className?: string;
  disabled?: boolean;
};

export type ActionConnectProps = ActionButtonProps;

export const ActionConnect = memo(function ActionConnect({
  className,
  disabled,
}: ActionConnectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(selectIsStepperStepping);
  const handleClick = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  return (
    <Button
      fullWidth={true}
      borderless={true}
      className={className}
      onClick={handleClick}
      disabled={disabled || isStepping}
    >
      {t('Network-ConnectWallet')}
    </Button>
  );
});

export type ActionSwitchProps = { chainId: ChainEntity['id'] } & ActionButtonProps;

export const ActionSwitch = memo(function ActionSwitch({
  chainId,
  className,
  disabled,
}: ActionSwitchProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(selectIsStepperStepping);
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => {
    dispatch(askForNetworkChange({ chainId }));
  }, [dispatch, chainId]);

  return (
    <Button
      fullWidth={true}
      borderless={true}
      className={className}
      onClick={handleClick}
      disabled={disabled || isStepping}
    >
      {t('Network-Change', { network: chain.name })}
    </Button>
  );
});

export type ActionConnectSwitchProps = ActionButtonProps & {
  chainId?: ChainEntity['id'];
  children: ReactNode;
};

export const ActionConnectSwitch = memo(function ActionConnectSwitch({
  children,
  className,
  chainId,
  disabled,
}: ActionConnectSwitchProps) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return <ActionConnect className={className} disabled={disabled} />;
  }

  if (chainId && chainId !== connectedChainId) {
    return <ActionSwitch chainId={chainId} className={className} disabled={disabled} />;
  }

  return children;
});
