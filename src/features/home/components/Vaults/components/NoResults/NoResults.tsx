import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../../store';
import {
  selectFilterUserCategory,
  selectHasActiveFilterExcludingUserCategoryAndSort,
} from '../../../../../data/selectors/filtered-vaults';
import { styles } from './styles';
import { selectIsWalletKnown } from '../../../../../data/selectors/wallet';
import { useTranslation } from 'react-i18next';
import { selectIsUserBalanceAvailable } from '../../../../../data/selectors/data-loader';
import { Loader } from '../../../../../../components/Loader';

const useStyles = makeStyles(styles);

type MessageProps = {
  title?: string;
  text: string;
};

const Message = memo<MessageProps>(function ({ title = 'NoResults-NoResultsFound', text }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.message}>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.text}>{t(text)}</div>
    </div>
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
    return <Message text="NoResults-NotConnected" />;
  }

  if (!userBalanceAvailable && (userCategory === 'eligible' || userCategory === 'deposited')) {
    return <LoadingMessage />;
  }

  if (!hasActiveFilter && userCategory === 'deposited') {
    return <Message text="NoResults-NotDeposited" />;
  }

  return <Message text="NoResults-TryClearFilters" />;
});
