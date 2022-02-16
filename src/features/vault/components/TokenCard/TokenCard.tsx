import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { LinkButton } from '../../../../components/LinkButton';
import { styles } from './styles';
import { TokenEntity, TokenErc20 } from '../../../data/entities/token';
import { useSelector } from 'react-redux';
import { selectChainById } from '../../../data/selectors/chains';
import { BeefyState } from '../../../../redux-types';
import { useTokenAddressbookData } from '../../../data/hooks/addressbook';
import { ChainEntity } from '../../../data/entities/chain';
import { Loader } from '../../../../components/loader';

const useStyles = makeStyles(styles as any);

function TokenCardDisplay({ token }: { token: TokenErc20 }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const chain = useSelector((state: BeefyState) => selectChainById(state, token.chainId));

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={token.symbol} />
        <div className={classes.cardActions}>
          {token.website && (
            <div className={classes.cardAction}>
              <LinkButton type="link" href={token.website} text={t('Token-Site')} />
            </div>
          )}
          {token.contractAddress && (
            <div className={classes.cardAction}>
              <LinkButton
                href={`${chain.explorerUrl}/token/${token.contractAddress}`}
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
          {token.description ? token.description : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
}

function TokenCardComponent({
  chainId,
  tokenId,
}: {
  chainId: ChainEntity['id'];
  tokenId: TokenEntity['id'];
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const addressBook = useTokenAddressbookData(chainId, tokenId);

  return addressBook ? (
    <TokenCardDisplay token={addressBook} />
  ) : (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={tokenId} />
      </CardHeader>
      <CardContent>
        <Typography variant="body1" className={classes.text}>
          <Loader />
        </Typography>
      </CardContent>
    </Card>
  );
}

export const TokenCard = React.memo(TokenCardComponent);
