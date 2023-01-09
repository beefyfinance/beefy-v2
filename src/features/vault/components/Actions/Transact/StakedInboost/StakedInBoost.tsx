import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';
import { selectDepositTokenByVaultId } from '../../../../../data/selectors/tokens';
import { selectTotalUserBalanceInBoostsInDepositToken } from '../../../../../data/selectors/balance';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { TokenImage } from '../../../../../../components/TokenImage/TokenImage';

const useStyles = makeStyles(styles);

export type StakedInBoostProps = {
  className?: string;
};
export const StakedInBoost = memo<StakedInBoostProps>(function ({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const balance = useAppSelector(state =>
    selectTotalUserBalanceInBoostsInDepositToken(state, vaultId)
  );

  if (!depositToken || !balance || balance.lte(BIG_ZERO)) {
    return null;
  }

  return (
    <div className={clsx(classes.container, className)}>
      <TokenImage
        chainId={depositToken.chainId}
        tokenAddress={depositToken.address}
        className={classes.icon}
      />
      <div className={classes.text}>
        <Trans
          t={t}
          i18nKey="Transact-StakedInBoost"
          values={{
            symbol: depositToken.symbol,
          }}
          components={{
            amount: <TokenAmountFromEntity amount={balance} token={depositToken} />,
            orange: <span className={classes.tokenAmount} />,
          }}
        />
      </div>
    </div>
  );
});
