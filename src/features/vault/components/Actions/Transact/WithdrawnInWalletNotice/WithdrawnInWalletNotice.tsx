import React, { memo } from 'react';
import { AlertInfo } from '../../../../../../components/Alerts';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type WithdrawnInWalletNoticeProps = {
  className?: string;
};

export const WithdrawnInWalletNotice = memo<WithdrawnInWalletNoticeProps>(
  function WithdrawnInWalletNotice({ className }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const vaultId = useAppSelector(selectTransactVaultId);
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const balance = useAppSelector(state =>
      selectUserBalanceOfToken(state, vault.chainId, depositToken.address)
    );

    if (balance.lte(BIG_ZERO) || !vault.removeLiquidityUrl) {
      return null;
    }

    return (
      <AlertInfo className={className}>
        <Trans
          t={t}
          i18nKey="Transact-Notice-WithdrawnInWallet"
          components={{
            platformLink: (
              <a
                href={vault.removeLiquidityUrl}
                className={classes.link}
                target={'_blank'}
                rel={'noopener'}
              />
            ),
            amount: <TokenAmountFromEntity amount={balance} token={depositToken} />,
          }}
          values={{ token: depositToken.symbol }}
        />
      </AlertInfo>
    );
  }
);
