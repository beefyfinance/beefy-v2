import { memo, type MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { ActionConnect, ActionSwitch } from '../CommonActions/CommonActions.tsx';

type WithdrawButtonProps = {
  chainId: ChainEntity['id'];
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
};

export const WithdrawButton = memo(function WithdrawButton({
  chainId,
  onClick,
}: WithdrawButtonProps) {
  const { t } = useTranslation();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);

  if (!isWalletConnected) {
    return <ActionConnect variant="success" size="xs" />;
  }

  if (chainId !== connectedChainId) {
    return <ActionSwitch variant="success" size="xs" chainId={chainId} />;
  }

  return (
    <Button variant="success" size="xs" onClick={onClick}>
      {t('Transact-Withdraw')}
    </Button>
  );
});
