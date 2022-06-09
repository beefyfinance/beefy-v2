import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
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
import { useAppDispatch, useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

function TokenCardDisplay({ token }: { token: TokenEntity }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const chain = useAppSelector(state => selectChainById(state, token.chainId));

  return (
    <Card>
      <CardHeader>
        <div className={classes.detailTitle}>{t('Token-Detail')}</div>
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
                href={`${chain.explorerUrl}/token/${token.address}`}
                className={classes.cardAction}
                text={t('Token-Contract')}
                type="code"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={classes.text}>
          {token.description ? token.description : t('Token-NoDescrip')}
        </div>
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
  const tokenLoaded = useAppSelector(
    state =>
      (selectIsAddressBookLoaded(state, chainId) && selectIsTokenLoaded(state, chainId, tokenId)) ||
      false
  );
  const token = useAppSelector(state =>
    tokenLoaded ? selectTokenById(state, chainId, tokenId) : null
  );
  const shouldInitAddressBook = useAppSelector(state =>
    selectShouldInitAddressBook(state, chainId)
  );
  // initialize addressbook
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    if (shouldInitAddressBook) {
      dispatch(fetchAddressBookAction({ chainId: chainId }));
    }
  }, [dispatch, chainId, shouldInitAddressBook]);

  // sometimes we have mooX tokens in the asset list
  // so we never know if a token will ever load or not
  // see: vault beets-sound-of-moosic
  if (!tokenLoaded || !token) {
    return <></>;
  }

  return <TokenCardDisplay token={token} />;
}

export const TokenCard = React.memo(TokenCardComponent);
