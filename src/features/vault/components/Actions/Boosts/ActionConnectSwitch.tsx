import { type CssStyles } from '@repo/styles/css';
import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../data/store/hooks.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet.ts';
import type { ChainEntity } from '../../../../data/entities/chain.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { selectIsStepperStepping } from '../../../../data/selectors/stepper.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../data/selectors/wallet.ts';

type ActionButtonProps = {
  css?: CssStyles;
  disabled?: boolean;
};

export type ActionConnectProps = ActionButtonProps;

export const ActionConnect = memo(function ActionConnect({
  css: cssProp,
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
      css={cssProp}
      onClick={handleClick}
      disabled={disabled || isStepping}
      variant="success"
    >
      {t('Network-ConnectWallet')}
    </Button>
  );
});

export type ActionSwitchProps = {
  chainId: ChainEntity['id'];
} & ActionButtonProps;

export const ActionSwitch = memo(function ActionSwitch({
  chainId,
  css: cssProp,
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
      css={cssProp}
      onClick={handleClick}
      disabled={disabled || isStepping}
      variant="success"
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
  css: cssProp,
  chainId,
  disabled,
}: ActionConnectSwitchProps) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return <ActionConnect css={cssProp} disabled={disabled} />;
  }

  if (chainId && chainId !== connectedChainId) {
    return <ActionSwitch chainId={chainId} css={cssProp} disabled={disabled} />;
  }

  return children;
});
