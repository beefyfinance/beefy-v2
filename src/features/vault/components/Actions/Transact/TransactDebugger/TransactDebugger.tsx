import { lazy, memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectTokenByAddressOrUndefined } from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';
import { TransactState } from './TransactState.tsx';

const CurveZap = lazy(() =>
  import('./CurveZap.tsx').then(module => ({ default: module.CurveZap }))
);
const BalancerZap = lazy(() =>
  import('./BalancerZap.tsx').then(module => ({ default: module.BalancerZap }))
);

const useStyles = legacyMakeStyles(styles);

type TransactDebuggerProps = {
  vaultId: string;
};

const TransactDebugger = memo(function TransactDebugger({ vaultId }: TransactDebuggerProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, vault.chainId, vault.depositTokenAddress)
  );

  return (
    <div className={classes.container}>
      {depositToken && depositToken.providerId === 'curve' ?
        <CurveZap vaultId={vaultId} />
      : null}
      {(
        depositToken &&
        depositToken.providerId &&
        ['balancer', 'beethovenx'].includes(depositToken.providerId)
      ) ?
        <BalancerZap vaultId={vaultId} />
      : null}
      <TransactState />
    </div>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default TransactDebugger;
