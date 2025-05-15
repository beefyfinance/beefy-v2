import { styled } from '@repo/styles/jsx';
import { token } from '@repo/styles/tokens';
import { memo, useCallback } from 'react';
import type { TenderlyState } from '../../features/data/reducers/tenderly-types.ts';
import { tenderlyClose } from '../../features/data/reducers/tenderly.ts';
import {
  selectTenderlyErrorOrUndefined,
  selectTenderlyMode,
  selectTenderlyStatus,
} from '../../features/data/selectors/tenderly.ts';
import { Card } from '../../features/vault/components/Card/Card.tsx';
import { CardContent } from '../../features/vault/components/Card/CardContent.tsx';
import { CardHeader } from '../../features/vault/components/Card/CardHeader.tsx';
import { CardTitle } from '../../features/vault/components/Card/CardTitle.tsx';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import CloseIcon from '../../images/icons/mui/Close.svg?react';
import { Modal } from '../Modal/Modal.tsx';
import { CallsForm } from './Calls/CallsForm.tsx';
import { LoginForm } from './Login/LoginForm.tsx';
import logoUrl from './logo.svg';
import { RequestForm } from './Request/RequestForm.tsx';
import { ResultForm } from './Result/ResultForm.tsx';
import { SimulateForm } from './Simulate/SimulateForm.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

const FallbackMode = memo(function FallbackMode() {
  const mode = useAppSelector(selectTenderlyMode);
  const status = useAppSelector(selectTenderlyStatus);
  const error = useAppSelector(selectTenderlyErrorOrUndefined);

  return (
    <>
      <div>{mode}</div>
      <div>{status}</div>
      {error ?
        <div>{error.message || error.name || 'unknown error'}</div>
      : null}
    </>
  );
});

const modeToComponent = {
  calls: CallsForm,
  login: LoginForm,
  request: RequestForm,
  simulate: SimulateForm,
  result: ResultForm,
};

type TenderlyModalProps = {
  mode: Exclude<TenderlyState['mode'], 'closed'>;
  onClose: () => void;
};

const TenderlyModal = memo<TenderlyModalProps>(function TenderlyModal({ mode, onClose }) {
  const classes = useStyles();
  const Component = modeToComponent[mode] || FallbackMode;

  return (
    <Card>
      <CardHeader>
        <img src={logoUrl} alt="" width={24} height={24} className={classes.cardIcon} />
        <CardTitle>Tenderly Simulation</CardTitle>
        <button type="button" onClick={onClose} aria-label="close" className={classes.closeButton}>
          <CloseIcon color={token('colors.text.dark')} />
        </button>
      </CardHeader>
      <StyledCardContent>
        <Component />
      </StyledCardContent>
    </Card>
  );
});

const StyledCardContent = styled(CardContent, {
  base: {
    minHeight: '200px',
    overflowY: 'auto',
    flexShrink: 1,
  },
});

export const Tenderly = memo(function Tenderly() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTenderlyMode);
  const open = mode !== 'closed';
  const handleClose = useCallback(() => {
    dispatch(tenderlyClose());
  }, [dispatch]);

  return (
    <Modal open={open} onClose={handleClose}>
      {open ?
        <TenderlyModal mode={mode} onClose={handleClose} />
      : null}
    </Modal>
  );
});
