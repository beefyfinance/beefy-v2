import { Modal, Box, IconButton, Typography, Button, Paper, InputBase } from '@material-ui/core';
import React from 'react';
import { Card } from '../../features/vault/components/Card';
import { CardHeader } from '../../features/vault/components/Card/CardHeader';
import { CardContent } from '../../features/vault/components/Card/CardContent';
import { CardTitle } from '../../features/vault/components/Card/CardTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { makeStyles } from '@material-ui/styles';
import { AssetsImage } from '../AssetsImage';

const useStyles = makeStyles(styles as any);

function _Bridge({ open, handleClose }: { open: boolean; handleClose: () => void }) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    minWidth: '400px',
  };
  return (
    <Modal
      aria-labelledby="bridge-modal-title"
      aria-describedby="bridge-modal-description"
      open={open}
      onClose={handleClose}
    >
      <Box sx={style}>
        <Preview />
      </Box>
    </Modal>
  );
}

function Preview() {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Card>
      <CardHeader className={classes.header}>
        <Box>
          <CardTitle titleClassName={classes.title} title={t('Bridge-Title')} />
          <Typography className={classes.powerBy} variant="body2">
            {t('Bridge-PowerBy')}
          </Typography>
        </Box>
        <IconButton className={classes.removeHover} aria-label="settings">
          <CloseIcon htmlColor="#8A8EA8" />
        </IconButton>
      </CardHeader>
      <CardContent className={classes.content}>
        {/*From */}
        <Box>
          <Box className={classes.flexContainer}>
            <Typography variant="body2" className={classes.label}>
              {t('From')}
            </Typography>
            <Typography className={classes.balance} variant="body2">
              {t('Balance')} <span>4 BIFI</span>
            </Typography>
          </Box>
          <Box className={classes.flexContainer}>
            <Box className={classes.networkPicker}> a</Box>
            <Box className={classes.inputContainer}>
              <Paper component="form" className={classes.root}>
                <Box className={classes.inputLogo}>
                  <AssetsImage assets={[]} img={'BIFI-TOKEN.svg'} alt={'BinSpirit'} />
                </Box>
                <InputBase placeholder="0.00" value={0} disabled={true} />
                <Button>{t('Transact-Max')}</Button>
              </Paper>
            </Box>
          </Box>
        </Box>
        <Box className={classes.customDivider}>
          <Box className={classes.line} />
          <img alt="arrowDown" src={require('../../images/arrowDown.svg').default} />
          <Box className={classes.line} />
        </Box>
        {/* To */}
        <Box>
          <Box className={classes.flexContainer}>
            <Typography variant="body2" className={classes.label}>
              {t('To')}
            </Typography>
          </Box>
          <Box className={classes.flexContainer}>
            <Box className={classes.networkPicker}> a</Box>
            <Box className={classes.inputContainer}>
              <Paper component="form" className={classes.root}>
                <Box className={classes.inputLogo}>
                  <AssetsImage assets={[]} img={'BIFI-TOKEN.svg'} alt={'BinSpirit'} />
                </Box>
                <InputBase placeholder="0.00" value={0} disabled={true} />
                <Button>{t('Transact-Max')}</Button>
              </Paper>
            </Box>
          </Box>
        </Box>
        {/* Fees */}
        <FeesInfo />
        <Button className={classes.btn}>{t('Bridge-Button-1')}</Button>
      </CardContent>
    </Card>
  );
}

const FeesInfo = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Box className={classes.fees}>
      <Box className={classes.feesContent}>
        {/*Crosschain */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-Crosschain')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            0.00%
          </Typography>
        </Box>
        {/*Gas fee */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-Gas')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            0.00 BIFI
          </Typography>
        </Box>
        {/* Min Amount */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-MinAmount')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            0.02 BIFI
          </Typography>
        </Box>
        {/* Max Amount */}
        <Box className={classes.feesItem}>
          <Typography className={classes.label} variant="body2">
            {t('Bridge-MaxAmount')}
          </Typography>
          <Typography className={classes.value} variant="h5">
            5000 BIFI
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" className={classes.advice}>
        {t('Bridge-Advice-1')}
      </Typography>
      <Typography variant="body2" className={classes.advice}>
        {t('Bridge-Advice-2')}
      </Typography>
    </Box>
  );
};

export const Bridge = React.memo(_Bridge);
