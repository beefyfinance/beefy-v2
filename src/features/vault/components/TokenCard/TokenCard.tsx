import { makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
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
import { ChainEntity } from '../../../data/entities/chain';
import { memoize } from 'lodash';

interface AddressBookToken {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  website?: string;
  description?: string;
}

// these are expensive to fetch so we do this at the last moment and memoize result
// might be a good idea to make it as a redux action if needed at some other place
const getTokenAddressBook = memoize(
  async (
    chainId: ChainEntity['id']
  ): Promise<{
    [tokenId: TokenEntity['id']]: AddressBookToken;
  }> => {
    const addressBook = await import(
      `blockchain-addressbook/build/address-book/${chainId}/tokens/tokens`
    );
    return addressBook.tokens;
  }
);

const useStyles = makeStyles(styles as any);
function TokenCardComponent({ token }: { token: TokenEntity }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const chain = useSelector((state: BeefyState) => selectChainById(state, token.chainId));
  const addressBook = useTokenAddressbookData(token.chainId, token.id);
  const contractAddress = addressBook
    ? addressBook.address
    : isTokenErc20(token)
    ? token.contractAddress
    : null;

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={addressBook ? addressBook.symbol : token.symbol} />
        <div className={classes.cardActions}>
          {addressBook && (
            <div className={classes.cardAction}>
              <LinkButton type="link" href={addressBook.website} text={t('Token-Site')} />
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
          {addressBook && addressBook.description ? addressBook.description : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const TokenCard = React.memo(TokenCardComponent);

function useTokenAddressbookData(chainId: ChainEntity['id'], tokenId: TokenEntity['id']) {
  const [addressBook, setTokenAddressBook] = useState<null | AddressBookToken>(null);

  useEffect(() => {
    (async () => {
      const tokens = await getTokenAddressBook(chainId);
      if (tokens && tokenId in tokens) {
        setTokenAddressBook(tokens[tokenId]);
      }
    })();
  }, [chainId, tokenId]);

  return addressBook;
}
