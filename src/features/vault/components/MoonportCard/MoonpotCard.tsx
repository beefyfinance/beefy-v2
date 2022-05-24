import React from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { styles } from './styles';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectMoonpotData } from '../../../data/selectors/partners';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles as any);

const MoonpotCard = ({ vaultId }: { vaultId: string }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const moonpotData = useAppSelector(state => selectMoonpotData(state, vaultId));

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img
          className={classes.logo}
          src={require(`../../../../images/${moonpotData.img}`).default}
          alt={depositToken.symbol}
        />{' '}
        <Box>
          <Typography variant="body1" className={classes.subtitle}>
            {t('Moonpot-Stake', { name: depositToken.symbol })}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Moonpot-Title', { name: depositToken.symbol })}
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
