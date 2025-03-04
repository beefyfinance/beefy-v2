import type { ChainEntity } from '../../../../data/entities/chain.ts';
import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../store.ts';
import { selectIsStepperStepping } from '../../../../data/selectors/stepper.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet.ts';
import { Button } from '../../../../../components/Button/Button.tsx';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../data/selectors/wallet.ts';
import { type CssStyles } from '@repo/styles/css';

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
