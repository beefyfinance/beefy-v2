import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { styles } from './styles';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectMoonpotData } from '../../../data/selectors/partners';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

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
        <div>
          <div className={classes.subtitle}>
            {t('Moonpot-Stake', { name: depositToken.symbol })}
          </div>
          <div className={classes.title}>{t('Moonpot-Title', { name: depositToken.symbol })}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={classes.content}>{t('Moonpot-Content')}</div>
        <Button href={moonpotData.link} target="_blank" rel="noreferrer" className={classes.btn}>
          {t('Moonpot-Btn')}
        </Button>
      </CardContent>
    </Card>
  );
};

export const Moonpot = React.memo(MoonpotCard);
