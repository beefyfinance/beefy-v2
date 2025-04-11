import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import {
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../../../data/selectors/tokens.ts';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectBoostUserBalanceInToken } from '../../../../../data/selectors/balance.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { selectBoostById } from '../../../../../data/selectors/boosts.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import { useTranslation } from 'react-i18next';

export const BoostStaked = memo(function BoostStaked({
  boostId,
}: {
  boostId: BoostPromoEntity['id'];
}) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectStandardVaultById(state, boost.vaultId));
  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  return (
    <Value>
      <Label>{t('Staked')}</Label>
      <Amount>
        <TokenAmount amount={boostBalance} decimals={mooToken.decimals} />
        {depositToken.symbol}
        <VaultIcon size={24} vaultId={vault.id} />
      </Amount>
    </Value>
  );
});

const Value = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
  },
});

const Amount = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});
