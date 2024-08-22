import { lazy, memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { TransactState } from './TransactState';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectTokenByAddressOrUndefined } from '../../../../../data/selectors/tokens';

const CurveZap = lazy(() => import(`./CurveZap`));

const useStyles = makeStyles(styles);

type TransactDebuggerProps = {
  vaultId: string;
};

const TransactDebugger = memo<TransactDebuggerProps>(function TransactDebugger({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, vault.chainId, vault.depositTokenAddress)
  );

  return (
    <div className={classes.container}>
      {depositToken && depositToken.providerId === 'curve' ? <CurveZap vaultId={vaultId} /> : null}
      <TransactState />
    </div>
  );
});

// eslint-disable-next-line no-restricted-syntax
export default TransactDebugger;
