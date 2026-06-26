import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { InternalLink } from '../../../../../../components/Banners/Links/InternalLink.tsx';
import { selectUserVaultBalanceInShareTokenInBoosts } from '../../../../../data/selectors/balance.ts';
import { selectTransactDepositFromVaultId } from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

const noticeStyle = css.raw({
  textStyle: 'body.medium',
  '& a': {
    color: 'text.boosted',
    textDecoration: 'none',
  },
});

export type DepositFromVaultBoostNoticeProps = {
  css?: CssStyles;
};

export const DepositFromVaultBoostNotice = memo(function DepositFromVaultBoostNotice({
  css: cssProp,
}: DepositFromVaultBoostNoticeProps) {
  const { t } = useTranslation();
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const hasBoostedDeposit = useAppSelector(state => {
    if (!fromVaultId) return false;
    const deposit = selectUserVaultBalanceInShareTokenInBoosts(state, fromVaultId);
    return deposit.gt(0);
  });

  const vault = useAppSelector(state =>
    fromVaultId ? selectVaultById(state, fromVaultId) : undefined
  );

  if (!fromVaultId || !vault || !hasBoostedDeposit) {
    return null;
  }

  return (
    <AlertWarning css={css.raw(noticeStyle, cssProp)}>
      <Trans
        t={t}
        i18nKey="Transact-Notice-DepositFromVaultBoost"
        values={{ vaultName: vault.names.list }}
        components={{
          VaultLink: <InternalLink to={`/vault/${fromVaultId}`} />,
        }}
      />
    </AlertWarning>
  );
});
