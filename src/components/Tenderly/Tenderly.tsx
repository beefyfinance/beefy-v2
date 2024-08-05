import React, { memo, useCallback } from 'react';
import {
  selectTenderlyErrorOrUndefined,
  selectTenderlyMode,
  selectTenderlyStatus,
} from '../../features/data/selectors/tenderly';
import { useAppDispatch, useAppSelector } from '../../store';
import { Modal } from '../Modal';
import { tenderlyClose } from '../../features/data/reducers/tenderly';
import { Card, CardContent, CardHeader, CardTitle } from '../../features/vault/components/Card';
import { IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { ResultForm } from './Result/ResultForm';
import { RequestForm } from './Request/RequestForm';
import { LoginForm } from './Login/LoginForm';
import { CallsForm } from './Calls/CallsForm';
import logoUrl from './logo.svg';
import { SimulateForm } from './Simulate/SimulateForm';
import type { TenderlyState } from '../../features/data/reducers/tenderly-types';

const useStyles = makeStyles(styles);

const FallbackMode = memo(function FallbackMode() {
  const mode = useAppSelector(selectTenderlyMode);
  const status = useAppSelector(selectTenderlyStatus);
  const error = useAppSelector(selectTenderlyErrorOrUndefined);

  return (
    <>
      <div>{mode}</div>
      <div>{status}</div>
      {error ? <div>{error.message || error.name || 'unknown error'}</div> : null}
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
    <div className={classes.cardHolder}>
      <Card className={classes.card}>
        <CardHeader className={classes.cardHeader}>
          <img src={logoUrl} alt="" width={24} height={24} className={classes.cardIcon} />
          <CardTitle title="Tenderly Simulation" titleClassName={classes.cardTitle} />
          <IconButton onClick={onClose} aria-label="close" className={classes.closeButton}>
            <CloseIcon htmlColor="#999CB3" />
          </IconButton>
        </CardHeader>
        <CardContent className={classes.cardContent}>
          <Component />
        </CardContent>
      </Card>
    </div>
  );
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
      {open ? <TenderlyModal mode={mode} onClose={handleClose} /> : <></>}
    </Modal>
  );
});
