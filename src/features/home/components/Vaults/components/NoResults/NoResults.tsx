import { memo, PropsWithChildren, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFilterUserCategory,
  selectHasActiveFilterExcludingUserCategoryAndSort,
} from '../../../../../data/selectors/filtered-vaults';
import { styles } from './styles';
import {
  selectIsWalletKnown,
  selectWalletAddressIfKnown,
} from '../../../../../data/selectors/wallet';
import { useTranslation } from 'react-i18next';
import { selectIsUserBalanceAvailable } from '../../../../../data/selectors/data-loader';
import { Loader } from '../../../../../../components/Loader';
import { askForWalletConnection, doDisconnectWallet } from '../../../../../data/actions/wallet';
import { Button } from '../../../../../../components/Button';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';

const useStyles = makeStyles(styles);

type MessageProps = PropsWithChildren<{
  title: string;
  text: string;
}>;

const Message = memo<MessageProps>(function ({ title, text, children }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.message}>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.text}>{t(text)}</div>
      {children ? <div className={classes.extra}>{children}</div> : null}
    </div>
  );
});

const NotConnectedMessage = memo<MessageProps>(function ({ title, text }) {
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

const NotDepositedMessage = memo<MessageProps>(function ({ title, text }) {
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

const LoadingMessage = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.message}>
      <Loader />
    </div>
  );
});

export const NoResults = memo(function () {
  const hasActiveFilter = useAppSelector(selectHasActiveFilterExcludingUserCategoryAndSort);
  const userCategory = useAppSelector(selectFilterUserCategory);
  const userBalanceAvailable = useAppSelector(selectIsUserBalanceAvailable);
  const isWalletKnown = useAppSelector(selectIsWalletKnown);

  if (!isWalletKnown && (userCategory === 'eligible' || userCategory === 'deposited')) {
    return (
      <NotConnectedMessage
        title={'NoResults-NotConnected'}
        text={
          userCategory === 'deposited'
            ? 'NoResults-ConnectToViewMyVaults'
            : 'NoResults-ConnectToViewEligibleVaults'
        }
      />
    );
  }

  if (!userBalanceAvailable && (userCategory === 'eligible' || userCategory === 'deposited')) {
    return <LoadingMessage />;
  }

  if (!hasActiveFilter && userCategory === 'deposited') {
    return <NotDepositedMessage title="NoResults-NotDeposited" text="NoResults-FindVault" />;
  }

  return <Message title="NoResults-NoResultsFound" text="NoResults-TryClearFilters" />;
});
