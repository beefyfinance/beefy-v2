import { memo, useCallback, useEffect, useState } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts';
import { getWeb3Instance } from '../../../../../data/apis/instances';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById, selectVaultStrategyAddress } from '../../../../../data/selectors/vaults';
import { selectChainById } from '../../../../../data/selectors/chains';
import { ChainEntity } from '../../../../../data/entities/chain';
import { AbiItem } from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAsync } from '../../../../../../helpers/useAsync';
import { isAfter } from 'date-fns';
import { TimeUntil } from '../../../../../../components/TimeUntil';
import { Trans, useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);
const enableForVaults: VaultEntity['id'][] = ['gmx-arb-glp', 'gmx-avax-glp'];
const strategyABI: AbiItem[] = [
  {
    inputs: [],
    name: 'withdrawOpen',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function getUnlockTime(strategyAddress: string, chain: ChainEntity) {
  const web3 = await getWeb3Instance(chain);
  const strategyContract = new web3.eth.Contract(strategyABI, strategyAddress);
  const withdrawOpen = await strategyContract.methods.withdrawOpen().call();
  const timestamp = new BigNumber(withdrawOpen || '0').multipliedBy(1000).toNumber();
  return new Date(timestamp);
}

type GlpWithdrawCountdownImplProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

const GlpWithdrawCountdownImpl = memo<GlpWithdrawCountdownImplProps>(
  function GlpWithdrawCountdownImpl({ vaultId, onChange }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const strategyAddress = useAppSelector(state => selectVaultStrategyAddress(state, vault.id));

    const fetchUnlockTime = useCallback(() => {
      return getUnlockTime(strategyAddress, chain);
    }, [strategyAddress, chain]);

    const {
      execute: updateUnlockTime,
      status: updateStatus,
      value: unlockTime,
    } = useAsync(fetchUnlockTime, new Date(0));

    const [haveUpdatedOnce, setHaveUpdatedOnce] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
      const handle = setInterval(updateUnlockTime, 30000);
      return () => clearInterval(handle);
    }, [updateUnlockTime]);

    useEffect(() => {
      if (haveUpdatedOnce === false && updateStatus === 'success') {
        setHaveUpdatedOnce(true);
      }
    }, [updateStatus, haveUpdatedOnce, setHaveUpdatedOnce]);

    useEffect(() => {
      if (haveUpdatedOnce) {
        const handle = setInterval(() => {
          const now = new Date();
          setIsLocked(isAfter(unlockTime, now));
        }, 1000);

        return () => clearInterval(handle);
      }
    }, [unlockTime, haveUpdatedOnce, setIsLocked]);

    useEffect(() => {
      onChange(isLocked);
    }, [onChange, isLocked]);

    const AlertComponent = isLocked ? AlertError : AlertWarning;

    return (
      <AlertComponent className={classes.alert}>
        <p>{t('Glp-Withdraw-Notice')}</p>
        {haveUpdatedOnce && isLocked ? (
          <p>
            <Trans
              t={t}
              i18nKey="Glp-Withdraw-Notice-Unlocks"
              components={{
                countdown: <TimeUntil time={unlockTime} minParts={1} />,
              }}
            />
          </p>
        ) : null}
      </AlertComponent>
    );
  }
);

type GlpWithdrawCountdownProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

export const GlpWithdrawLockNotice = memo<GlpWithdrawCountdownProps>(function GlpWithdrawCountdown({
  vaultId,
  onChange,
}) {
  if (enableForVaults.includes(vaultId)) {
    return <GlpWithdrawCountdownImpl vaultId={vaultId} onChange={onChange} />;
  }

  return null;
});
