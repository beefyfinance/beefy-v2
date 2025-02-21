import { memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectAllChainIds, selectChainById } from '../../../../features/data/selectors/chains';
import { SearchableList } from '../../../SearchableList';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../Button';
import { styles } from './styles';
import { InputBase, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { ChainIcon } from '../../../ChainIcon';
import { ModifiedListItem, ModifiedListItemEndComponent } from './ListItems';
import { RpcStepEnum } from './RpcModal';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import { updateActiveRpc } from '../../../../features/data/actions/chains';

const useStyles = makeStyles(styles);

export interface RpcStepsProps {
  handleStep: (step: RpcStepEnum) => void;
  setEditChainId: (chainId: string | null) => void;
  editChainId: ChainEntity['id'] | null;
}

export const Menu = memo<RpcStepsProps>(function Menu({ handleStep, setEditChainId }) {
  const classes = useStyles();
  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const onSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      setEditChainId(chainId);
      handleStep(RpcStepEnum.Edit);
    },
    [handleStep, setEditChainId]
  );

  return (
    <>
      <div className={clsx(classes.flexGrow, classes.list)}>
        <SearchableList
          options={chainIds}
          onSelect={onSelect}
          ItemInnerComponent={ModifiedListItem}
          EndComponent={ModifiedListItemEndComponent}
          size="sm"
          hideShadows={true}
        />
      </div>
    </>
  );
});

export const Edit = memo<RpcStepsProps>(function Edit({ handleStep, setEditChainId, editChainId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const chain = useAppSelector(state => editChainId && selectChainById(state, editChainId));
  const [updatedRPC, setUpdatedRPC] = useState('');

  const isDisabled = useMemo(() => {
    const regex = /^https:\/\//;

    return updatedRPC.length > 7 && !regex.test(updatedRPC);
  }, [updatedRPC]);

  const handleSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedRPC(e.target.value);
  };

  const dispatch = useAppDispatch();
  const onSave = useCallback(() => {
    dispatch(updateActiveRpc(chain!.id, updatedRPC));
    handleStep(RpcStepEnum.Menu);
    setEditChainId(null);
  }, [dispatch, handleStep, setEditChainId, chain, updatedRPC]);

  if (!chain) return null;

  return (
    <>
      <div className={clsx(classes.flexGrow, classes.edit)}>
        <div className={classes.chainInfo}>
          <ChainIcon chainId={chain.id} />
          {chain.name}
        </div>
        <div className={classes.inputContainer}>
          <InputBase
            className={classes.input}
            value={updatedRPC}
            onChange={handleSearchText}
            fullWidth={true}
            placeholder={t('RpcModal-InputPlaceholder')}
          />
          {isDisabled && <div className={classes.inputError}>{t('RpcModal-InvalidRpc')}</div>}
        </div>
        <div className={classes.emptyTextContainer}>{t('RpcModal-EmptyList')}</div>
      </div>
      <div className={classes.footer}>
        <Button disabled={isDisabled} onClick={onSave} size="lg" style={{ width: '100%' }}>
          {t('RpcModal-Save')}
        </Button>
      </div>
    </>
  );
});
