import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectMoonpotData } from '../../../data/selectors/partners';
import { selectTokenById } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles as any);

const MoonpotCard = ({ vaultId }: { vaultId: string }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );
  const moonpotData = useSelector((state: BeefyState) => selectMoonpotData(state, vaultId));

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img
          className={classes.logo}
          src={require(`../../../../images/${moonpotData.img}`).default}
          alt={oracleToken.symbol}
        />{' '}
        <Box>
          <Typography variant="body1" className={classes.subtitle}>
            {t('Moonpot-Stake', { name: oracleToken.symbol })}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Moonpot-Title', { name: oracleToken.symbol })}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('Moonpot-Content')}
        </Typography>
        <a className={classes.link} target="_blank" rel="noreferrer" href={moonpotData.link}>
          <Button className={classes.btn}>{t('Moonpot-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const Moonpot = React.memo(MoonpotCard);
