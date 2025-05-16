import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import type { ToggleProps } from '../../../../../../components/Toggle/Toggle.tsx';
import { Toggle } from '../../../../../../components/Toggle/Toggle.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import buildLpIcon from '../../../../../../images/icons/build-lp.svg';
import OpenInNewRoundedIcon from '../../../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectTransactDepositTokensForChainIdWithBalances,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import type { ListItemProps } from './components/ListItem/ListItem.tsx';
import { ListItem } from './components/ListItem/ListItem.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);
const DUST_HIDDEN_THRESHOLD = new BigNumber('0.01');

export type DepositTokenSelectListProps = {
  css?: CssStyles;
};

export const DepositTokenSelectList = memo(function DepositTokenSelectList({
  css: cssProp,
}: DepositTokenSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const [dustHidden, setDustHidden] = useState(false);
  const [selectedChain] = useState(vault.chainId);
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
  // const hasMultipleChains = availableChains.length > 1;
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
    <div className={css(styles.container, cssProp)}>
      <div className={classes.search}>
        <SearchInput value={search} onValueChange={setSearch} />
      </div>
      <div className={classes.walletToggle}>
        <div className={classes.inWallet}>{t('Transact-TokenSelect-InYourWallet')}</div>
        <div className={classes.hideDust}>
          <Toggle
            checked={dustHidden}
            onChange={handleToggleDust}
            startAdornment={t('Transact-TokenSelect-HideDust')}
          />
        </div>
      </div>
      {/*hasMultipleChains ? <div className={classes.chainSelector}>TODO {selectedChain}</div> : null*/}
      <Scrollable css={styles.listContainer}>
        <div className={classes.list}>
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
          : <div className={classes.noResults}>{t('Transact-TokenSelect-NoResults')}</div>}
        </div>
      </Scrollable>
      {filteredOptionsForChain?.length > 1 && <BuildLpManually vaultId={vaultId} />}
    </div>
  );
});

const BuildLpManually = memo(function BuildLpManually({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { t } = useTranslation();
  const classes = useStyles();

  if (!vault.addLiquidityUrl) {
    return null;
  }

  return (
    <a className={classes.buildLp} href={vault.addLiquidityUrl} target="_blank">
      <div className={classes.buildLpContent}>
        <img src={buildLpIcon} alt="buildLp" />
        {t('Build LP Manually')}
      </div>
      <OpenInNewRoundedIcon fontSize="inherit" className={classes.icon} />
    </a>
  );
});
