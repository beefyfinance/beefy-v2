import React from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import QiDaoLogo from '../../../../images/partners/qidao.svg';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

const QiDaoCard = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const earnedToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={QiDaoLogo} alt="qidao" /> <div className={classes.title}>{t('QiDao-Title')}</div>
      </CardHeader>
      <CardContent>
        <div className={classes.content}>{t('QiDao-Content')}</div>
        <a
          className={classes.link}
          target="_blank"
          rel="noreferrer"
          href="https://app.mai.finance/vaults"
        >
          <Button className={classes.btn}>
            {t('QiDao-Btn', { mooToken: earnedToken.symbol })}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const QiDao = React.memo(QiDaoCard);
