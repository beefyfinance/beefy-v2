import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { LinkButton } from '../../../../components/LinkButton';
import { styles } from './styles';
import { isTokenErc20, TokenEntity } from '../../../data/entities/token';
import { useSelector } from 'react-redux';
import { selectChainById } from '../../../data/selectors/chains';
import { BeefyState } from '../../../../redux-types';

const useStyles = makeStyles(styles as any);
function TokenCardComponent({ token }: { token: TokenEntity }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const chain = useSelector((state: BeefyState) => selectChainById(state, token.chainId));
  // todo: async load token description and website
  const website = '';
  const description = '';

  const contractAddress = isTokenErc20(token) ? token.contractAddress : null;

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={token.symbol} />
        <div className={classes.cardActions}>
          {website && (
            <div className={classes.cardAction}>
              <LinkButton type="link" href={website} text={t('Token-Site')} />
            </div>
          )}
          {contractAddress && (
            <div className={classes.cardAction}>
              <LinkButton
                href={`${chain.explorerUrl}/token/${contractAddress}`}
                className={classes.cardAction}
                text={t('Token-Contract')}
                type="code"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="body1" className={classes.text}>
          {description ? description : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const TokenCard = React.memo(TokenCardComponent);
