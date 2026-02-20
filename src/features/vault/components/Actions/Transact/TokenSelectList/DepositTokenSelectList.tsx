import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import type { ToggleProps } from '../../../../../../components/Toggle/Toggle.tsx';
import { Toggle } from '../../../../../../components/Toggle/Toggle.tsx';
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
  WalletToggleDust,
  WalletToggleLabel,
  WalletToggleRow,
} from '../common/CommonListStyles.tsx';
import { selectListScrollable, buildLpLink } from '../common/CommonListStylesRaw.ts';

const DUST_HIDDEN_THRESHOLD = new BigNumber('0.01');

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
  const [dustHidden, setDustHidden] = useState(false);
  const transactChainId = useAppSelector(selectTransactSelectedChainId);
  const selectedChain = transactChainId ?? vault.chainId;
  const [search, setSearch] = useState('');
  const optionsForChain = useAppSelector(state =>
    selectTransactDepositTokensForChainIdWithBalances(state, selectedChain, vaultId)
  );
  const filteredOptionsForChain = useMemo(() => {
    let options = optionsForChain;

    if (search.length) {
      options = options.filter(option =>
        option.tokens
          .map(token => token.symbol)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (dustHidden) {
      options = options.filter(option => option.balanceValue.gte(DUST_HIDDEN_THRESHOLD));
    }

    return options;
  }, [optionsForChain, search, dustHidden]);
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
  const handleToggleDust = useCallback<ToggleProps['onChange']>(
    checked => {
      setDustHidden(checked);
    },
    [setDustHidden]
  );

  return (
    <SelectListContainer css={cssProp}>
      <SelectListSearch>
        <SearchInput value={search} onValueChange={setSearch} />
      </SelectListSearch>
      <WalletToggleRow>
        <WalletToggleLabel>{t('Transact-TokenSelect-InYourWallet')}</WalletToggleLabel>
        <WalletToggleDust>
          <Toggle
            checked={dustHidden}
            onChange={handleToggleDust}
            startAdornment={t('Transact-TokenSelect-HideDust')}
          />
        </WalletToggleDust>
      </WalletToggleRow>
      <Scrollable css={selectListScrollable}>
        <SelectListItems>
          {filteredOptionsForChain.length ?
            filteredOptionsForChain.map(option => (
              <ListItem
                key={option.id}
                selectionId={option.id}
                tokens={option.tokens}
                balance={option.balance}
                decimals={option.decimals}
                tag={option.tag}
                chainId={selectedChain}
                onSelect={handleTokenSelect}
              />
            ))
          : <SelectListNoResults>{t('Transact-TokenSelect-NoResults')}</SelectListNoResults>}
        </SelectListItems>
      </Scrollable>
      {filteredOptionsForChain?.length > 1 && <BuildLpManually vaultId={vaultId} />}
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
