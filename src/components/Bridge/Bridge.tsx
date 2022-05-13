import { Modal, Box, Typography } from '@material-ui/core';
import React from 'react';
import { Card } from '../../features/vault/components/Card';
import { CardHeader } from '../../features/vault/components/Card/CardHeader';
import { CardTitle } from '../../features/vault/components/Card/CardTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { makeStyles } from '@material-ui/styles';
import { Preview } from './components/Preview';
import { Confirm } from './components/Confirm';

const useStyles = makeStyles(styles as any);

function _Bridge({ open, handleClose }: { open: boolean; handleClose: () => void }) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    width: '400px',
    height: '620px',
  };

  const [previewConfirm, setPreviewConfirm] = React.useState('preview');

  const { t } = useTranslation();
  const classes = useStyles();

  const handleModal = () => {
    handleClose();
    setPreviewConfirm('preview');
  };

  return (
    <Modal
      aria-labelledby="bridge-modal-title"
      aria-describedby="bridge-modal-description"
      open={open}
      onClose={handleModal}
      BackdropProps={{ className: classes.backdrop }}
    >
      <Box sx={style}>
        <Card>
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

            <CloseIcon onClick={handleModal} htmlColor="#8A8EA8" />
          </CardHeader>
          <>
            {previewConfirm === 'preview' ? (
              <Preview handlePreview={() => setPreviewConfirm('confirm')} />
            ) : (
              <Confirm />
            )}
          </>
        </Card>
      </Box>
    </Modal>
  );
}

export const Bridge = React.memo(_Bridge);
