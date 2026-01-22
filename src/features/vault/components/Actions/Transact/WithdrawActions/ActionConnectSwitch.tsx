import { css, type CssStyles } from '@repo/styles/css';
import { type FC, memo } from 'react';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import {
  ActionConnect,
  type ActionConnectSwitchProps,
  ActionSwitch,
} from '../CommonActions/CommonActions.tsx';

export type ActionConnectSwitchWithFeesProps = ActionConnectSwitchProps & {
  css?: CssStyles;
  FeesComponent?: FC;
};

export const ActionConnectSwitchWithFees = memo(function ActionConnectSwitchWithFees({
  children,
  css: cssProp,
  chainId,
  FeesComponent,
}: ActionConnectSwitchWithFeesProps) {
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
