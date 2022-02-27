import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { LinkButton } from '../../../../components/LinkButton';
import { Loader } from '../../../../components/loader';
import { BeefyState } from '../../../../redux-types';
import { fetchAddressBookAction } from '../../../data/actions/tokens';
import { ChainEntity } from '../../../data/entities/chain';
import { isTokenErc20, TokenEntity } from '../../../data/entities/token';
import { selectChainById } from '../../../data/selectors/chains';
import {
  selectIsAddressBookLoaded,
  selectShouldInitAddressBook,
} from '../../../data/selectors/data-loader';
import { selectIsTokenLoaded, selectTokenById } from '../../../data/selectors/tokens';
import { Card } from '../Card/Card';
import { CardContent } from '../Card/CardContent';
import { CardHeader } from '../Card/CardHeader';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';

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

  const tokenLoaded = useSelector(
    (state: BeefyState) =>
      (selectIsAddressBookLoaded(state, chainId) && selectIsTokenLoaded(state, chainId, tokenId)) ||
      false
  );
  const token = useSelector((state: BeefyState) =>
    tokenLoaded ? selectTokenById(state, chainId, tokenId) : null
  );
  const shouldInitAddressBook = useSelector((state: BeefyState) =>
    selectShouldInitAddressBook(state, chainId)
  );
  // initialize addressbook
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (shouldInitAddressBook) {
      dispatch(fetchAddressBookAction({ chainId: chainId }));
    }
  }, [dispatch, chainId, shouldInitAddressBook]);

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
          {!tokenLoaded ? <Loader /> : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const TokenCard = React.memo(TokenCardComponent);
