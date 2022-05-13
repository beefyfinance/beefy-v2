import React, { useMemo } from 'react';
import { makeStyles, Box, Typography, Button, InputBase, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { useSelector } from 'react-redux';
import { selectAllChains } from '../../../features/data/selectors/chains';
import { CardContent } from '../../../features/vault/components/Card/CardContent';
import { Fees } from './Fees';
import { AssetsImage } from '../../AssetsImage';
import { SimpleDropdown } from '../../SimpleDropdown';

const useStyles = makeStyles(styles as any);

function _Preview({ handlePreview }) {
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
        <img src={require(`../../../images/networks/${network}.svg`).default} alt={network} />{' '}
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
        <img alt="arrowDown" src={require('../../../images/arrowDown.svg').default} />
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
      <Fees />
      <Box mt={4}>
        <Button onClick={handlePreview} className={classes.btn}>
          {t('Bridge-Button-1', { network: 'Fantom' })}
        </Button>
      </Box>
    </CardContent>
  );
}

export const Preview = React.memo(_Preview);
