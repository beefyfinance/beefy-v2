import { memo, useCallback, useState } from 'react';
import { CardHeader, CardTitle } from '../../../../features/vault/components/Card';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/styles';
import { Preview } from '../Preview';
import { Confirm } from '../Confirm';
import { selectCurrentChainId } from '../../../../features/data/selectors/wallet';
import { useStepper } from '../../../Steps/hooks';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { Modal } from '../../../Modal';

const useStyles = makeStyles(styles);

function _Bridge({ open, handleClose }: { open: boolean; handleClose: () => void }) {
  const [previewConfirm, setPreviewConfirm] = useState('preview');

  const { t } = useTranslation();
  const classes = useStyles();

  const handleModal = useCallback(() => {
    handleClose();
    setPreviewConfirm('preview');
  }, [handleClose, setPreviewConfirm]);

  const handleNext = useCallback(() => {
    setPreviewConfirm('confirm');
  }, [setPreviewConfirm]);

  const handleBack = useCallback(() => {
    setPreviewConfirm('preview');
  }, [setPreviewConfirm]);

  const currentChainId = useAppSelector(state => selectCurrentChainId(state));

  const [startStepper, isStepping, Stepper] = useStepper(currentChainId);

  return (
    <>
      <Modal open={open} onClose={handleModal}>
        <div className={classes.modal}>
          <div className={classes.container}>
            <CardHeader className={classes.header}>
              <div className={classes.headerTitleClose}>
                <CardTitle
                  title={t(previewConfirm === 'preview' ? 'Bridge-Title' : 'Bridge-Title-Confirm')}
                />
                <CloseIcon className={classes.cross} onClick={handleModal} />
              </div>
              {previewConfirm === 'preview' ? (
                <div className={classes.powerBy}>{t('Bridge-PowerBy')}</div>
              ) : null}
            </CardHeader>
            {previewConfirm === 'preview' ? (
              <Preview handleModal={handleModal} handlePreview={handleNext} />
            ) : (
              <Confirm
                handleModal={handleModal}
                handleBack={handleBack}
                startStepper={startStepper}
                isStepping={isStepping}
              />
            )}
          </div>
        </div>
      </Modal>
      <Stepper />
    </>
  );
}

export const BridgeModal = memo(_Bridge);
