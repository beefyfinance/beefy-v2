import { css } from '@repo/styles/css';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage/AssetsImage.tsx';
import { IconButtonLink } from '../../../../components/IconButtonLink/IconButtonLink.tsx';
import { PriceWithChange } from '../../../../components/PriceWithChange/PriceWithChange.tsx';
import { explorerTokenUrl } from '../../../../helpers/url.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import Code from '../../../../images/icons/mui/Code.svg?react';
import Link from '../../../../images/icons/mui/Link.svg?react';
import DocsIcon from '../../../../images/icons/navigation/docs.svg?react';
import { fetchAddressBookAction } from '../../../data/actions/tokens.ts';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import { isTokenErc20, isTokenNative } from '../../../data/entities/token.ts';
import { selectBridgeByIdIfKnown } from '../../../data/selectors/bridges.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import {
  selectIsAddressBookLoaded,
  selectIsTokenLoaded,
  selectShouldInitAddressBook,
  selectTokenById,
} from '../../../data/selectors/tokens.ts';
import { BridgeTag, NativeTag } from '../BridgeTag/BridgeTag.tsx';
import {
  AssetIconSymbol,
  AssetsBridgePrice,
  AssetSymbol,
  Container,
  Description,
  Links,
  styles,
  TitleContainer,
} from './styles.ts';

function TokenCardDisplay({ token }: { token: TokenEntity }) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, token.chainId));
  const isErc20 = isTokenErc20(token);
  const isNative = isTokenNative(token) || (isErc20 && token.bridge === 'native');
  const bridge = useAppSelector(state =>
    isErc20 && token.bridge && !isNative ? selectBridgeByIdIfKnown(state, token.bridge) : undefined
  );

  return (
    <Container>
      <TitleContainer>
        <AssetIconSymbol>
          <AssetsImage assetSymbols={[token.symbol]} chainId={chain.id} size={24} />
          <AssetSymbol>{token.symbol}</AssetSymbol>
        </AssetIconSymbol>
        <Links>
          {token.website && (
            <IconButtonLink
              Icon={Link}
              text={t('Token-Site')}
              href={token.website}
              textCss={styles.assetLinkText}
            />
          )}
          {isErc20 && (
            <IconButtonLink
              Icon={Code}
              href={explorerTokenUrl(chain, token.address)}
              text={t('Token-Contract')}
              textCss={styles.assetLinkText}
            />
          )}
          {token.documentation && (
            <IconButtonLink
              Icon={DocsIcon}
              href={token.documentation}
              text={t('Token-Docs')}
              textCss={styles.assetLinkText}
            />
          )}
        </Links>
        <AssetsBridgePrice>
          {isNative ?
            <NativeTag chain={chain} />
          : bridge ?
            <BridgeTag bridge={bridge} chain={chain} />
          : null}
          <PriceWithChange oracleId={token.oracleId} />
        </AssetsBridgePrice>
      </TitleContainer>
      <Description className={css(!token.description && styles.descriptionPending)}>
        {token.description ? token.description : t('Token-NoDescrip')}
      </Description>
    </Container>
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
  useEffect(() => {
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

export const TokenCard = memo(TokenCardComponent);
