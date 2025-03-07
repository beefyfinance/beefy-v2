import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { type FC, memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet.ts';
import { Button } from '../../../../../../components/Button/Button.tsx';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type ActionButtonProps = {
  css?: CssStyles;
};

export const ActionConnect = memo(function ActionConnect({ css: cssProp }: ActionButtonProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(selectIsStepperStepping);
  const handleClick = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  return (
    <Button
      variant="success"
      fullWidth={true}
      borderless={true}
      css={cssProp}
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
export const ActionSwitch = memo(function ActionSwitch({
  chainId,
  css: cssProp,
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
      variant="success"
      fullWidth={true}
      borderless={true}
      css={cssProp}
      onClick={handleClick}
      disabled={isStepping}
    >
      {t('Network-Change', { network: chain.name })}
    </Button>
  );
});

export type ActionConnectSwitchProps = {
  css?: CssStyles;
  chainId?: ChainEntity['id'];
  children: ReactNode;
  FeesComponent?: FC;
};

export const ActionConnectSwitch = memo(function ActionConnectSwitch({
  children,
  css: cssProp,
  chainId,
  FeesComponent,
}: ActionConnectSwitchProps) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return (
      <div className={css(cssProp)}>
        <ActionConnect />
        {FeesComponent && <FeesComponent />}
      </div>
    );
  }

  if (chainId && chainId !== connectedChainId) {
    return (
      <div className={css(cssProp)}>
        <ActionSwitch chainId={chainId} />
        {FeesComponent && <FeesComponent />}
      </div>
    );
  }

  return <>{children}</>;
});
