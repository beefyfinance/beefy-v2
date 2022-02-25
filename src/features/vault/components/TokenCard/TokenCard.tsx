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
import { useDispatch, useSelector } from 'react-redux';
import { selectChainById } from '../../../data/selectors/chains';
import { BeefyState } from '../../../../redux-types';
import { ChainEntity } from '../../../data/entities/chain';
import { Loader } from '../../../../components/loader';
import { selectTokenById } from '../../../data/selectors/tokens';
import { fetchAddressBookAction } from '../../../data/actions/tokens';

const useStyles = makeStyles(styles as any);

function TokenCardDisplay({ token }: { token: TokenEntity }) {
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
          {isTokenErc20(token) && (
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

  const addressBookLoaded = useSelector(
    (state: BeefyState) =>
      state.ui.dataLoader.byChainId[chainId]?.addressBook.alreadyLoadedOnce || false
  );
  const token = useSelector((state: BeefyState) =>
    addressBookLoaded ? selectTokenById(state, chainId, tokenId) : null
  );
  // initialize addressbook
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchAddressBookAction({ chainId: chainId }));
  }, [dispatch, chainId]);

  return token ? (
    <TokenCardDisplay token={token} />
  ) : (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={tokenId} />
      </CardHeader>
      <CardContent>
        <Typography variant="body1" className={classes.text}>
          {!addressBookLoaded ? <Loader /> : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const TokenCard = React.memo(TokenCardComponent);
