import { Modal, Box, Typography, Button, Paper, InputBase } from '@material-ui/core';
import React, { useMemo } from 'react';
import { Card } from '../../features/vault/components/Card';
import { CardHeader } from '../../features/vault/components/Card/CardHeader';
import { CardContent } from '../../features/vault/components/Card/CardContent';
import { CardTitle } from '../../features/vault/components/Card/CardTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { makeStyles } from '@material-ui/styles';
import { AssetsImage } from '../AssetsImage';
import { useSelector } from 'react-redux';
import { selectAllChains } from '../../features/data/selectors/chains';
import { SimpleDropdown } from '../SimpleDropdown';
import { selectWalletAddress } from '../../features/data/selectors/wallet';
import { BeefyState } from '../../redux-types';
import clsx from 'clsx';

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

function Preview({ handlePreview }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [network1, setNetwork1] = React.useState('bsc');
  const { t } = useTranslation();
  const classes = useStyles();

  const chains = useSelector(selectAllChains);
  const chainTypes = useMemo(() => {
    const list = {};
    for (const chain of chains) {
      list[chain.id] = chain.name;
    }
    return list;
  }, [chains]);

  const selectedRenderer = network => {
    return (
      <Box className={classes.networkPickerContainer}>
        <img src={require(`../../images/networks/${network}.svg`).default} alt={network} />{' '}
        <Typography className={classes.networkValue}>{chainTypes[network]}</Typography>
      </Box>
    );
  };

  return (
    <CardContent className={classes.content}>
      {/*From */}
      <Box>
        <Box mb={1} className={classes.flexContainer}>
          <Typography variant="body2" className={classes.label}>
            {t('FROM')}
          </Typography>
          <Typography className={classes.balance} variant="body2">
            {t('Balance')}: <span>4 BIFI</span>
          </Typography>
        </Box>
        <Box className={classes.flexContainer}>
          <Box className={classes.networkPicker}>
            <SimpleDropdown
              list={chainTypes}
              selected={network1}
              handler={() => console.log('item')}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
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
      <Box mb={3}>
        <Box mb={1} className={classes.flexContainer}>
          <Typography variant="body2" className={classes.label}>
            {t('TO')}
          </Typography>
        </Box>
        <Box className={classes.flexContainer}>
          <Box className={classes.networkPicker}>
            <SimpleDropdown
              list={chainTypes}
              selected={network1}
              handler={() => console.log('item')}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </Box>
              <InputBase placeholder="0.00" value={0} disabled={true} />
              <Button>{t('Transact-Max')}</Button>
            </Paper>
          </Box>
        </Box>
      </Box>
      {/* Fees */}
      <FeesInfo />
      <Box mt={4}>
        <Button onClick={handlePreview} className={classes.btn}>
          {t('Bridge-Button-1', { network: 'Fantom' })}
        </Button>
      </Box>
    </CardContent>
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
      <Typography variant="body2" className={classes.advice1}>
        {t('Bridge-Advice-2')}
      </Typography>
    </Box>
  );
};

function Confirm() {
  const { t } = useTranslation();
  const classes = useStyles();

  const walletAddress = useSelector((state: BeefyState) => selectWalletAddress(state));

  return (
    <CardContent className={classes.content}>
      <Box>
        <Typography variant="body1">{t('Bridge-Confirm-Content')}</Typography>
      </Box>
      <Box className={classes.fees}>
        <Box mb={1}>
          <Typography variant="body2" className={classes.label}>
            {t('FROM')}
          </Typography>
        </Box>
        <Box mb={1.5} className={classes.flexContainer}>
          <Box className={classes.networkContainer}>
            <img
              className={classes.icon}
              alt=""
              src={require(`../../images/networks/bsc.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              BNB Chain
            </Typography>
          </Box>
          <Typography className={classes.bridgedValue} variant="body1">
            -1.00 BIFI
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.address}>
            {t('Address')}: <span>{walletAddress}</span>
          </Typography>
        </Box>
      </Box>
      <Box className={classes.customDivider}>
        <Box className={classes.line} />
        <img alt="arrowDown" src={require('../../images/arrowDown.svg').default} />
        <Box className={classes.line} />
      </Box>
      <Box className={clsx(classes.fees, classes.lastMarginFees)}>
        <Box mb={1}>
          <Typography variant="body2" className={classes.label}>
            {t('TO')}
          </Typography>
        </Box>
        <Box mb={2} className={classes.flexContainer}>
          <Box className={classes.networkContainer}>
            <img
              className={classes.icon}
              alt=""
              src={require(`../../images/networks/fantom.svg`).default}
            />
            <Typography className={classes.chainName} variant="body1">
              Fantom
            </Typography>
          </Box>
          <Typography className={classes.bridgedValue} variant="body1">
            +1.00 BIFI
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.address}>
            {t('Address')}: <span>{walletAddress}</span>
          </Typography>
        </Box>
      </Box>
      <Box mb={1} className={classes.flexContainer}>
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-Crosschain')}:
        </Typography>
        <Typography variant="body2" className={classes.value}>
          0.0%
        </Typography>
      </Box>
      <Box mb={1} className={classes.flexContainer}>
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-Gas')}:
        </Typography>
        <Typography variant="body2" className={classes.value}>
          0 BIFI
        </Typography>
      </Box>
      <Box mb={3} className={classes.flexContainer}>
        <Typography variant="body2" className={classes.advice1}>
          {t('Bridge-EstimatedTime')}
        </Typography>
        <Typography variant="body2" className={classes.value}>
          3 - 30 min
        </Typography>
      </Box>
      <Button className={classes.btn}>{t('Confirm')}</Button>
    </CardContent>
  );
}

export const Bridge = React.memo(_Bridge);
