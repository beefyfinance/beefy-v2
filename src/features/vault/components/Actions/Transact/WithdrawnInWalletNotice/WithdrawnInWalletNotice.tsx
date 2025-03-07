import { memo } from 'react';
import { AlertInfo } from '../../../../../../components/Alerts/Alerts.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type WithdrawnInWalletNoticeProps = {
  css?: CssStyles;
};

export const WithdrawnInWalletNotice = memo(function WithdrawnInWalletNotice({
  css: cssProp,
}: WithdrawnInWalletNoticeProps) {
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
    <AlertInfo css={cssProp}>
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
});
