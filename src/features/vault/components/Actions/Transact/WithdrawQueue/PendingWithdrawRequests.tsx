import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../data/actions/wallet/stepper.ts';
import { fulfillRedeem } from '../../../../../data/actions/wallet/erc4626.ts';
import type { VaultErc4626 } from '../../../../../data/entities/vault.ts';
import { selectUserVaultPendingWithdrawal } from '../../../../../data/selectors/balance.ts';
import {
  selectErc20TokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { PendingRequest } from './PendingRequest.tsx';

export type PendingWithdrawRequestsProps = {
  vaultId: VaultErc4626['id'];
};

export const PendingWithdrawRequests = memo(function PendingWithdrawRequests({
  vaultId,
}: PendingWithdrawRequestsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const depositTokenPrice = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );
  const pending = useAppSelector(state => selectUserVaultPendingWithdrawal(state, vaultId));
  const chainId = vault.chainId;
  const handleWithdraw = useCallback(
    (id: bigint) => {
      dispatch(
        stepperStartWithSteps(
          [
            {
              step: 'fulfill-request-withdraw',
              message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
              action: fulfillRedeem(vaultId, id),
              pending: false,
              extraInfo: { zap: false, vaultId },
            },
          ],
          chainId
        )
      );
    },
    [dispatch, vaultId, chainId, t]
  );

  return (
    <Layout>
      <Header>{t('Transact-WithdrawRequests')}</Header>
      <Requests>
        {pending.requests.map(request => (
          <PendingRequest
            key={request.id.toString(10)}
            request={request}
            vaultId={vaultId}
            chainId={vault.chainId}
            depositToken={depositToken}
            depositTokenPrice={depositTokenPrice}
            onWithdraw={handleWithdraw}
          />
        ))}
      </Requests>
      <Divider />
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
  },
});

const Divider = styled('div', {
  base: {
    height: '1px',
    backgroundColor: 'darkBlue.60',
    margin: '12px 16px 0 16px',
  },
});

const Header = styled('div', {
  base: {
    color: 'text.dark',
  },
});

const Requests = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    borderRadius: '8px',
    contain: 'paint',
  },
});
