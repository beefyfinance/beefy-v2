import type { VaultErc4626 } from '../../../../../data/entities/vault.ts';
import type { TokenErc20 } from '../../../../../data/entities/token.ts';
import type BigNumber from 'bignumber.js';
import type { Erc4626PendingBalanceRequest } from '../../../../../data/apis/balance/balance-types.ts';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { Countdown } from './Countdown.tsx';
import { WithdrawButton } from './WithdrawButton.tsx';

type PendingRequestProps = {
  vaultId: VaultErc4626['id'];
  chainId: VaultErc4626['chainId'];
  depositToken: TokenErc20;
  depositTokenPrice: BigNumber;
  request: Erc4626PendingBalanceRequest;
  onWithdraw: (id: bigint) => void;
};
export const PendingRequest = memo(function PendingRequest({
  depositToken,
  depositTokenPrice,
  request,
  onWithdraw,
}: PendingRequestProps) {
  const { id, assets } = request;
  const value = useMemo(
    () => formatLargeUsd(assets.multipliedBy(depositTokenPrice)),
    [assets, depositTokenPrice]
  );
  const handleWithdraw = useCallback(() => {
    onWithdraw(id);
  }, [onWithdraw, id]);

  return (
    <Layout>
      <Amount>
        <Assets>
          <TokenAmountFromEntity amount={request.assets} token={depositToken} />{' '}
          {depositToken.symbol}
        </Assets>
        <Value>{value}</Value>
      </Amount>
      <Actions>
        <Countdown until={request.claimableTimestamp}>
          <WithdrawButton chainId={depositToken.chainId} onClick={handleWithdraw} />
        </Countdown>
      </Actions>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'darkBlue.80',
    padding: '8px 16px',
  },
});

const Amount = styled('div', {
  base: {
    maxWidth: '50%',
  },
});

const Assets = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const Actions = styled('div', {
  base: {
    maxWidth: '50%',
  },
});
