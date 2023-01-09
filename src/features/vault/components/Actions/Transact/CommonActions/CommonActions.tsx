import { ChainEntity } from '../../../../../data/entities/chain';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { Button } from '../../../../../../components/Button';

export type ActionButtonProps = {
  className?: string;
};

export const ActionConnect = memo<ActionButtonProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  return (
    <Button
      variant="success"
      fullWidth={true}
      borderless={true}
      className={className}
      onClick={handleClick}
    >
      {t('Network-ConnectWallet')}
    </Button>
  );
});

export type ActionSwitchProps = { chainId: ChainEntity['id'] } & ActionButtonProps;
export const ActionSwitch = memo<ActionSwitchProps>(function ({ chainId, className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => {
    dispatch(askForNetworkChange({ chainId }));
  }, [dispatch, chainId]);

  return (
    <Button
      variant="success"
      fullWidth={true}
      borderless={true}
      className={className}
      onClick={handleClick}
    >
      {t('Network-Change', { network: chain.name })}
    </Button>
  );
});
