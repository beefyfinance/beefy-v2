import type { PropsWithChildren } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { askForWalletConnection, doDisconnectWallet } from '../../../../../data/actions/wallet.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectIsUserBalanceAvailable } from '../../../../../data/selectors/balance.ts';
import {
  selectFilterUserCategory,
  selectHasActiveFilterExcludingUserCategoryAndSort,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type MessageProps = PropsWithChildren<{
  title: string;
  text: string;
}>;

const Message = memo(function Message({ title, text, children }: MessageProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.message}>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.text}>{t(text)}</div>
      {children ?
        <div className={classes.extra}>{children}</div>
      : null}
    </div>
  );
});

const NotConnectedMessage = memo(function NotConnectedMessage({ title, text }: MessageProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const handleWalletConnect = useCallback(() => {
    if (walletAddress) {
      dispatch(doDisconnectWallet());
    } else {
      dispatch(askForWalletConnection());
    }
  }, [dispatch, walletAddress]);

  return (
    <Message title={title} text={text}>
      <Button onClick={handleWalletConnect} variant="success">
        {t('NoResults-ConnectWallet')}
      </Button>
    </Message>
  );
});

const NotDepositedMessage = memo(function NotDepositedMessage({ title, text }: MessageProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleViewAll = useCallback(() => {
    dispatch(filteredVaultsActions.setUserCategory('all'));
  }, [dispatch]);

  return (
    <Message title={title} text={text}>
      <Button onClick={handleViewAll} variant="success">
        {t('NoResults-ViewAllVaults')}
      </Button>
    </Message>
  );
});

const LoadingMessage = memo(function LoadingMessage() {
  const classes = useStyles();
  return (
    <div className={classes.message}>
      <LoadingIndicator />
    </div>
  );
});

export const NoResults = memo(function NoResults() {
  const hasActiveFilter = useAppSelector(selectHasActiveFilterExcludingUserCategoryAndSort);
  const userCategory = useAppSelector(selectFilterUserCategory);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const userBalanceAvailable = useAppSelector(state =>
    selectIsUserBalanceAvailable(state, walletAddress)
  );

  if (!walletAddress && userCategory === 'deposited') {
    return (
      <NotConnectedMessage
        title={'NoResults-NotConnected'}
        text={'NoResults-ConnectToViewMyVaults'}
      />
    );
  }

  if (userCategory === 'saved') {
    return (
      <NotDepositedMessage title="NoResults-NoSavedVaults-Title" text="NoResults-NoSavedVaults" />
    );
  }

  if (!userBalanceAvailable && userCategory === 'deposited') {
    return <LoadingMessage />;
  }

  if (!hasActiveFilter && userCategory === 'deposited') {
    return <NotDepositedMessage title="NoResults-NotDeposited" text="NoResults-FindVault" />;
  }

  return <Message title="NoResults-NoResultsFound" text={'NoResults-TryClearFilters'} />;
});
