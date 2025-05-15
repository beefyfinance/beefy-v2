import { sva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { addToWalletActions } from '../../features/data/reducers/add-to-wallet.ts';
import {
  selectAddToWalletError,
  selectAddToWalletIconUrl,
  selectAddToWalletStatus,
  selectAddToWalletToken,
} from '../../features/data/selectors/add-to-wallet.ts';
import { Card } from '../../features/vault/components/Card/Card.tsx';
import { CardContent } from '../../features/vault/components/Card/CardContent.tsx';
import { CardHeader } from '../../features/vault/components/Card/CardHeader.tsx';
import { CardIconButton } from '../../features/vault/components/Card/CardIconButton.tsx';
import { CardTitle } from '../../features/vault/components/Card/CardTitle.tsx';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import CloseIcon from '../../images/icons/mui/Close.svg?react';
import { Modal } from '../Modal/Modal.tsx';
import { AddTokenForm } from './AddTokenForm.tsx';

const addTokenToWalletRecipe = sva({
  slots: ['card', 'cardHeader', 'cardIcon', 'cardTitle', 'closeButton', 'cardContent'],
  base: {
    card: {
      margin: 0,
      outline: 'none',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '500px',
      maxWidth: '100%',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '18px 24px',
      background: 'background.content.dark',
      borderRadius: '10px 10px 0px 0px ',
      borderBottom: `2px solid {background.border}`,
    },
    cardIcon: {
      marginRight: '8px',
      height: '32px',
    },
    cardTitle: {
      color: 'text.light',
      marginRight: 'auto',
    },
    closeButton: {
      '&:hover': {
        background: 'none',
      },
    },
    cardContent: {
      background: 'background.content',
      borderRadius: '0 0 12px 12px',
      padding: '24px',
      minHeight: '200px',
      flexShrink: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  },
});

const Pending = memo(function Pending() {
  return <div>Pending</div>;
});

const Rejected = memo(function Rejected() {
  const error = useAppSelector(selectAddToWalletError);
  return <div>Error: {error?.message || 'unknown error'}</div>;
});

const FulfilledCardTitle = memo(function FulfilledCardTitle() {
  const classes = addTokenToWalletRecipe();
  const { t } = useTranslation();
  const token = useAppSelector(selectAddToWalletToken);
  const iconUrl = useAppSelector(selectAddToWalletIconUrl);

  return (
    <CardTitle>
      {iconUrl && <img className={classes.cardIcon} src={iconUrl} alt={token.symbol} height={32} />}{' '}
      {t('Add-Token-To-Wallet', { token: token.symbol })}
    </CardTitle>
  );
});

const PendingCardTitle = memo(function PendingCardTitle() {
  const { t } = useTranslation();

  return <CardTitle>{t('Add-To-Wallet')}</CardTitle>;
});

export const AddTokenToWallet = memo(function AddTokenToWallet() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAddToWalletStatus);
  const isOpen = status !== 'idle';

  const handleClose = useCallback(() => {
    dispatch(addToWalletActions.close());
  }, [dispatch]);

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Card>
        <CardHeader>
          {status === 'fulfilled' ?
            <FulfilledCardTitle />
          : <PendingCardTitle />}
          <CardIconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </CardIconButton>
        </CardHeader>
        <StyledCardContent>
          {status === 'pending' && <Pending />}
          {status === 'rejected' && <Rejected />}
          {status === 'fulfilled' && <AddTokenForm />}
        </StyledCardContent>
      </Card>
    </Modal>
  );
});

const StyledCardContent = styled(CardContent, {
  base: {
    minHeight: '200px',
    flexShrink: 1,
    width: '510px',
  },
});
