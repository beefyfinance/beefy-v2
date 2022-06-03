import { Modal, Box, Typography, Paper } from '@material-ui/core';
import React from 'react';
import { CardHeader } from '../../features/vault/components/Card/CardHeader';
import { CardTitle } from '../../features/vault/components/Card/CardTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { makeStyles } from '@material-ui/styles';
import { Preview } from './components/Preview';
import { Confirm } from './components/Confirm';
import { useSelector } from 'react-redux';
import { selectCurrentChainId } from '../../features/data/selectors/wallet';
import { BeefyState } from '../../redux-types';
import { useStepper } from '../Steps/hooks';
import { backdropStyle } from '../../helpers/styleUtils';

const useStyles = makeStyles(styles);

function _Bridge({ open, handleClose }: { open: boolean; handleClose: () => void }) {
  const [previewConfirm, setPreviewConfirm] = React.useState('preview');

  const { t } = useTranslation();
  const classes = useStyles();

  const handleModal = () => {
    handleClose();
    setPreviewConfirm('preview');
  };

  const currentChainId = useSelector((state: BeefyState) => selectCurrentChainId(state));

  const [startStepper, isStepping, Stepper] = useStepper(currentChainId);

  return (
    <>
      <Modal
        aria-labelledby="bridge-modal-title"
        aria-describedby="bridge-modal-description"
        open={open}
        onClose={handleModal}
        BackdropProps={{ style: { ...backdropStyle } }}
      >
        <Box className={classes.modal}>
          <Paper className={classes.container}>
            <CardHeader className={classes.header}>
              <Box>
                {previewConfirm === 'preview' ? (
                  <>
                    <CardTitle titleClassName={classes.title} title={t('Bridge-Title')} />
                    <Typography className={classes.powerBy} variant="body2">
                      {t('Bridge-PowerBy')}
                    </Typography>
                  </>
                ) : (
                  <CardTitle titleClassName={classes.title} title={t('Bridge-Title-Confirm')} />
                )}
              </Box>

              <CloseIcon className={classes.cross} onClick={handleModal} />
            </CardHeader>
            <>
              {previewConfirm === 'preview' ? (
                <Preview
                  handleModal={handleModal}
                  handlePreview={() => setPreviewConfirm('confirm')}
                />
              ) : (
                <Confirm
                  handleModal={handleModal}
                  startStepper={startStepper}
                  isStepping={isStepping}
                />
              )}
            </>
          </Paper>
        </Box>
      </Modal>
      <Stepper />
    </>
  );
}

export const BridgeModal = React.memo(_Bridge);
