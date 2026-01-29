import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectUserDepositedVaultIds } from '../../../data/selectors/balance.ts';
import { selectWalletAddress } from '../../../data/selectors/wallet.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { selectUserVaultBalanceInDepositTokenWithToken } from '../../../data/selectors/balance.ts';
import { selectVaultPnl } from '../../../data/selectors/analytics.ts';
import { VaultIdImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { isUserClmPnl, type UserVaultPnl } from '../../../data/selectors/analytics-types.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';

export const BalancesTable = memo(function BalancesTable() {
  const { t } = useTranslation();
  const walletAddress = useAppSelector(selectWalletAddress);
  const depositedVaultIds = useAppSelector(state =>
    walletAddress ? selectUserDepositedVaultIds(state, walletAddress) : []
  );

  if (!walletAddress) {
    return (
      <Container>
        <EmptyState>
          <EmptyText>{t('Wallet-NotConnected')}</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  if (depositedVaultIds.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyText>{t('Dashboard-NoDeposits')}</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <TableHeader>
        <HeaderCell flex={2}>{t('Vault')}</HeaderCell>
        <HeaderCell flex={1} align="right">
          {t('Deposit')}
        </HeaderCell>
        <HeaderCell flex={1} align="right">
          {t('PnL')}
        </HeaderCell>
      </TableHeader>
      <TableBody>
        {depositedVaultIds.map(vaultId => (
          <BalanceRow key={vaultId} vaultId={vaultId} walletAddress={walletAddress} />
        ))}
      </TableBody>
    </Container>
  );
});

type BalanceRowProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
};

const BalanceRow = memo(function BalanceRow({ vaultId, walletAddress }: BalanceRowProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { token, amount } = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenWithToken(state, vaultId, walletAddress)
  );
  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, walletAddress));

  const depositDisplay = formatTokenDisplayCondensed(amount, token.decimals);
  const pnlValue = getPnlValue(pnlData);
  const pnlDisplay = formatLargeUsd(pnlValue, {
    positivePrefix: '+$',
    negativePrefix: '-$',
    zeroPrefix: '$',
  });
  const isPositive = pnlValue.gt(BIG_ZERO);
  const isNegative = pnlValue.lt(BIG_ZERO);

  return (
    <Row>
      <Cell flex={2}>
        <VaultInfo>
          <VaultIdImage vaultId={vaultId} size={28} />
          <VaultName>{vault.names.short}</VaultName>
        </VaultInfo>
      </Cell>
      <Cell flex={1} align="right">
        <DepositValue>
          <TokenAmount>{depositDisplay}</TokenAmount>
          <TokenSymbol>{token.symbol}</TokenSymbol>
        </DepositValue>
      </Cell>
      <Cell flex={1} align="right">
        <PnlValue positive={isPositive} negative={isNegative}>
          {pnlDisplay}
        </PnlValue>
      </Cell>
    </Row>
  );
});

function getPnlValue(pnlData: UserVaultPnl) {
  if ('totalPnlUsd' in pnlData) {
    return pnlData.totalPnlUsd;
  }

  if (isUserClmPnl(pnlData)) {
    return pnlData.pnl.withClaimedPending.usd;
  }
  return BIG_ZERO;
}

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});

const TableHeader = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: 'background.content.dark',
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
    gap: '12px',
    flexShrink: 0,
  },
});

const HeaderCell = styled('div', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.dark',
  },
  variants: {
    flex: {
      1: { flex: 1 },
      2: { flex: 2 },
    },
    align: {
      left: { textAlign: 'left' },
      right: { textAlign: 'right' },
    },
  },
  defaultVariants: {
    flex: 1,
    align: 'left',
  },
});

const TableBody = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
});

const Row = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    gap: '12px',
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
    _hover: {
      backgroundColor: 'background.content.dark',
    },
    _last: {
      borderBottom: 'none',
    },
  },
});

const Cell = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
  },
  variants: {
    flex: {
      1: { flex: 1 },
      2: { flex: 2 },
    },
    align: {
      left: { justifyContent: 'flex-start' },
      right: { justifyContent: 'flex-end' },
    },
  },
  defaultVariants: {
    flex: 1,
    align: 'left',
  },
});

const VaultInfo = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const VaultName = styled('span', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.light',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const DepositValue = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
});

const TokenAmount = styled('span', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.light',
  },
});

const TokenSymbol = styled('span', {
  base: {
    textStyle: 'body.xs',
    color: 'text.dark',
  },
});

const PnlValue = styled('span', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.light',
  },
  variants: {
    positive: {
      true: {
        color: 'green.40',
      },
    },
    negative: {
      true: {
        color: 'indicators.error',
      },
    },
  },
});

const EmptyState = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    height: '100%',
  },
});

const EmptyText = styled('p', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.dark',
  },
});
