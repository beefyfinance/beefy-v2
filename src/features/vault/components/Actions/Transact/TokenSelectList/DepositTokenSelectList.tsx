import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import buildLpIcon from '../../../../../../images/icons/build-lp.svg';
import OpenInNewRoundedIcon from '../../../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectTransactDepositTokensForChainIdWithBalances,
  selectTransactSelectedChainId,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import type { ListItemProps } from './components/ListItem/ListItem.tsx';
import { ListItem } from './components/ListItem/ListItem.tsx';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';
import {
  BuildLpContent,
  BuildLpIcon,
  SelectListContainer,
  SelectListItems,
  SelectListNoResults,
  SelectListSearch,
} from '../common/CommonListStyles.tsx';
import { selectListScrollable, buildLpLink } from '../common/CommonListStylesRaw.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { DustList } from './components/DustList/DustList.tsx';

// 1 USD
const DUST_THRESHOLD = new BigNumber('1');

export type DepositTokenSelectListProps = {
  css?: CssStyles;
};

export const DepositTokenSelectList = memo(function DepositTokenSelectList({
  css: cssProp,
}: DepositTokenSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const transactChainId = useAppSelector(selectTransactSelectedChainId);
  const selectedChain = transactChainId ?? vault.chainId;
  const [search, setSearch] = useState('');
  const optionsForChain = useAppSelector(state =>
    selectTransactDepositTokensForChainIdWithBalances(state, selectedChain, vaultId)
  );

  const searchFiltered = useMemo(() => {
    if (!search.length) return optionsForChain;
    const lowerSearch = search.toLowerCase();
    return optionsForChain.filter(option =>
      option.tokens
        .map(token => token.symbol)
        .join(' ')
        .toLowerCase()
        .includes(lowerSearch)
    );
  }, [optionsForChain, search]);

  const { normalOptions, dustOptions, dustTotalUsd } = useMemo(() => {
    const normal = [];
    const dust = [];
    let dustSum = BIG_ZERO;
    for (const option of searchFiltered) {
      if (option.balanceValue.gte(DUST_THRESHOLD)) {
        normal.push(option);
      } else if (option.balance && option.balance.gt(BIG_ZERO)) {
        dust.push(option);
        dustSum = dustSum.plus(option.balanceValue);
      }
    }
    return { normalOptions: normal, dustOptions: dust, dustTotalUsd: dustSum };
  }, [searchFiltered]);

  const handleTokenSelect = useCallback<ListItemProps['onSelect']>(
    tokenId => {
      dispatch(
        transactSelectSelection({
          selectionId: tokenId,
          resetInput: true,
        })
      );
    },
    [dispatch]
  );

  return (
    <SelectListContainer css={cssProp}>
      <SelectListSearch>
        <SearchInput value={search} onValueChange={setSearch} />
      </SelectListSearch>
      <Scrollable css={selectListScrollable}>
        <SelectListItems noGap={true}>
          {normalOptions.length ?
            normalOptions.map(option => (
              <ListItem
                key={option.id}
                selectionId={option.id}
                tokens={option.tokens}
                balance={option.balance}
                balanceValue={option.balanceValue}
                decimals={option.decimals}
                tag={option.tag}
                chainId={selectedChain}
                onSelect={handleTokenSelect}
              />
            ))
          : !dustOptions.length ?
            <SelectListNoResults>{t('Transact-TokenSelect-NoResults')}</SelectListNoResults>
          : null}
          {dustOptions.length > 0 && (
            <DustList dustTotalUsd={dustTotalUsd}>
              {dustOptions.map(option => (
                <ListItem
                  key={option.id}
                  selectionId={option.id}
                  tokens={option.tokens}
                  balance={option.balance}
                  balanceValue={option.balanceValue}
                  decimals={option.decimals}
                  tag={option.tag}
                  chainId={selectedChain}
                  onSelect={handleTokenSelect}
                />
              ))}
            </DustList>
          )}
        </SelectListItems>
      </Scrollable>
      {searchFiltered?.length > 1 && <BuildLpManually vaultId={vaultId} />}
    </SelectListContainer>
  );
});

const BuildLpManually = memo(function BuildLpManually({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { t } = useTranslation();

  if (!vault.addLiquidityUrl) {
    return null;
  }

  return (
    <ExternalLink className={css(buildLpLink)} href={vault.addLiquidityUrl}>
      <BuildLpContent>
        <img src={buildLpIcon} alt="buildLp" />
        {t('Build LP Manually')}
      </BuildLpContent>
      <BuildLpIcon>
        <OpenInNewRoundedIcon fontSize="inherit" />
      </BuildLpIcon>
    </ExternalLink>
  );
});
