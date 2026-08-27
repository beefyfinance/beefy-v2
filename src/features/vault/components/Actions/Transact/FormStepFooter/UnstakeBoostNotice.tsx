import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { VaultDepositTokenImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { transactSetUnstakeFromBoost } from '../../../../../data/actions/transact.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactExecuting,
  selectTransactUnstakeFromBoost,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';

export type UnstakeBoostNoticeProps = {
  vaultId: VaultEntity['id'];
  boost: BoostPromoEntity;
};

const UnstakeBoostNotice = memo(function UnstakeBoostNotice({
  vaultId,
  boost,
}: UnstakeBoostNoticeProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const checked = useAppSelector(selectTransactUnstakeFromBoost);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);

  const handleToggle = useCallback(() => {
    dispatch(transactSetUnstakeFromBoost(!checked));
  }, [dispatch, checked]);

  return (
    <ActionTokensNotice
      onClick={handleToggle}
      checked={checked}
      disabled={isExecuting || isStepping}
    >
      <Trans
        t={t}
        i18nKey="Transact-Notice-Withdraw-Boost-Unstake"
        values={{ boost: boost.tag.text || boost.title }}
        components={{
          Tokens: (
            <Inline>
              <VaultDepositTokenImage vault={vault} size={24} />
            </Inline>
          ),
        }}
      />
    </ActionTokensNotice>
  );
});

const Inline = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    marginLeft: '6px',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default UnstakeBoostNotice;
