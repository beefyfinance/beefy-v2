import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactDepositTokensForChainIdWithBalances,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { SearchInput } from '../../../../../../components/SearchInput';
import { Scrollable } from '../../../../../../components/Scrollable';
import type { ListItemProps } from './components/ListItem';
import { ListItem } from './components/ListItem';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import type { ToggleProps } from '../../../../../../components/Toggle';
import { Toggle } from '../../../../../../components/Toggle';
import clsx from 'clsx';
import buildLpIcon from '../../../../../../images/icons/build-lp.svg';
import type { VaultEntity } from '../../../../../data/entities/vault';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';

const useStyles = makeStyles(styles);
const DUST_HIDDEN_THRESHOLD = new BigNumber('0.01');

export type DepositTokenSelectListProps = {
  className?: string;
};

export const DepositTokenSelectList = memo<DepositTokenSelectListProps>(
  function DepositTokenSelectList({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const vaultId = useAppSelector(selectTransactVaultId);
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    // const availableChains = useAppSelector(selectTransactTokenChains);
    const [dustHidden, setDustHidden] = useState(false);
    const [selectedChain] = useState(vault.chainId);
    const [search, setSearch] = useState('');
    const optionsForChain = useAppSelector(state =>
      selectTransactDepositTokensForChainIdWithBalances(state, selectedChain)
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
          transactActions.selectSelection({
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
      <div className={clsx(classes.container, classes.deposit, className)}>
        <div className={classes.search}>
          <SearchInput value={search} onChange={setSearch} className={classes.searchInput} />
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
        <Scrollable className={classes.listContainer}>
          <div className={classes.list}>
            {filteredOptionsForChain.length ? (
              filteredOptionsForChain.map(option => (
                <ListItem
                  key={option.id}
                  selectionId={option.id}
                  tokens={option.tokens}
                  balance={option.balance}
                  chainId={selectedChain}
                  onSelect={handleTokenSelect}
                />
              ))
            ) : (
              <div className={classes.noResults}>{t('Transact-TokenSelect-NoResults')}</div>
            )}
          </div>
        </Scrollable>
        {filteredOptionsForChain?.length > 1 && <BuildLpManually vaultId={vaultId} />}
      </div>
    );
  }
);

const BuildLpManually = memo(function BuildLpManually({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { t } = useTranslation();
  const classes = useStyles();

  if (!vault.addLiquidityUrl) {
    return null;
  }

  return (
    <a
      className={classes.buildLp}
      href={vault.addLiquidityUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={classes.buildLpContent}>
        <img src={buildLpIcon} alt="buildLp" />
        {t('Build LP Manually')}
      </div>
      <OpenInNewRoundedIcon fontSize="inherit" className={classes.icon} />
    </a>
  );
});
