import { type ChangeEvent, memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import { selectAllChainIds, selectChainById } from '../../../../features/data/selectors/chains.ts';
import { SearchableList } from '../../../SearchableList/SearchableList.tsx';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { ModifiedListItem, ModifiedListItemEndComponent } from './ListItems.tsx';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { updateActiveRpc } from '../../../../features/data/actions/chains.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { BaseInput } from '../../../Form/Input/BaseInput.tsx';
import { Button } from '../../../Button/Button.tsx';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';

const useStyles = legacyMakeStyles(styles);

export interface MenuProps {
  onSelect: (chainId: ChainEntity['id']) => void;
}

export const Menu = memo(function Menu({ onSelect }: MenuProps) {
  const classes = useStyles();
  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      onSelect(chainId);
    },
    [onSelect]
  );

  return (
    <div className={classes.list}>
      <SearchableList
        options={chainIds}
        onSelect={handleSelect}
        ItemInnerComponent={ModifiedListItem}
        EndComponent={ModifiedListItemEndComponent}
        size="sm"
        hideShadows={true}
      />
    </div>
  );
});

const URL_REGX = /^https:\/\//;

export interface EditProps {
  chainId: ChainEntity['id'];
  onBack: () => void;
}

export const Edit = memo(function Edit({ chainId, onBack }: EditProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const [updatedRPC, setUpdatedRPC] = useState('');

  const isError = useMemo(() => {
    return updatedRPC.length > 7 && !URL_REGX.test(updatedRPC);
  }, [updatedRPC]);

  const isDisabled = useMemo(() => {
    return updatedRPC.length <= 7 || isError;
  }, [isError, updatedRPC.length]);

  const handleSearchText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUpdatedRPC(e.target.value);
    },
    [setUpdatedRPC]
  );

  const dispatch = useAppDispatch();
  const onSave = useCallback(() => {
    dispatch(updateActiveRpc(chain, updatedRPC));
    onBack();
  }, [dispatch, onBack, chain, updatedRPC]);

  return (
    <>
      <div className={classes.edit}>
        <div className={classes.chainInfo}>
          <ChainIcon chainId={chain.id} />
          {chain.name}
        </div>
        <div className={classes.inputContainer}>
          <BaseInput
            className={classes.input}
            value={updatedRPC}
            onChange={handleSearchText}
            fullWidth={true}
            placeholder={t('RpcModal-InputPlaceholder')}
          />
          {isError && <div className={classes.inputError}>{t('RpcModal-InvalidRpc')}</div>}
        </div>
        <div className={classes.emptyTextContainer}>{t('RpcModal-EmptyList')}</div>
      </div>
      <div className={classes.footer}>
        <Button disabled={isDisabled} onClick={onSave} size="lg" fullWidth={true}>
          {t('RpcModal-Save')}
        </Button>
      </div>
    </>
  );
});
