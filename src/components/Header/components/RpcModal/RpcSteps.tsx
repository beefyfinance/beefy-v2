import { memo, useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../store';
import { selectActiveChainIds, selectChainById } from '../../../../features/data/selectors/chains';
import { SearchableList } from '../../../SearchableList';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../Button';
import { styles } from './styles';
import { InputBase, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { ChainIcon } from '../../../ChainIcon';
import { ReactComponent as EmptyIcon } from '../../../../images/empty-state.svg';
import { ChainListItem, ModifiedListItem, ModifiedListItemEndComponent } from './ListItems';
import { RpcStepEnum } from './RpcModal';
import type { ChainEntity } from '../../../../features/data/entities/chain';

const useStyles = makeStyles(styles);

export interface RpcStepsProps {
  handleStep: (step: RpcStepEnum) => void;
  setEditChainId: (chainId: string | null) => void;
  editChainId: ChainEntity['id'] | null;
}

export const Menu = memo<RpcStepsProps>(function Menu({ handleStep, setEditChainId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  //change selector for updated Chains
  const chainIds = ['bsc'];

  const onSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      setEditChainId(chainId);
      handleStep(RpcStepEnum.Edit);
    },
    [handleStep, setEditChainId]
  );

  return (
    <>
      {chainIds.length > 0 ? (
        <div className={clsx(classes.flexGrow, classes.list)}>
          <SearchableList
            options={chainIds}
            onSelect={onSelect}
            ItemInnerComponent={ModifiedListItem}
            EndComponent={ModifiedListItemEndComponent}
            size="sm"
          />
        </div>
      ) : (
        <div className={clsx(classes.flexGrow, classes.emptyList)}>
          <EmptyIcon className={classes.emptyIcon} />
          <div className={classes.emptyTextContainer}>{t('RpcModal-EmptyList')}</div>
        </div>
      )}
      <div className={classes.footer}>
        <Button onClick={() => handleStep(RpcStepEnum.List)} size="lg" style={{ width: '100%' }}>
          {t('RpcModal-Add')}
        </Button>
      </div>
    </>
  );
});

export const Edit = memo<RpcStepsProps>(function Edit({ handleStep, setEditChainId, editChainId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const chain = useAppSelector(state => editChainId && selectChainById(state, editChainId));
  const [text, setText] = useState('');

  const isDisabled = useMemo(() => {
    const regex = /^https:\/\//;

    return text.length > 7 && !regex.test(text);
  }, [text]);

  const handleSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const onSave = useCallback(() => {
    //action to save  + return to menu
    handleStep(RpcStepEnum.Menu);
    setEditChainId(null);
  }, [handleStep, setEditChainId]);

  if (!chain) return null;

  return (
    <>
      <div className={clsx(classes.flexGrow, classes.edit)}>
        <div className={classes.chainInfo}>
          <ChainIcon chainId={chain.id} />
          {chain.name}
        </div>
        <InputBase
          className={classes.input}
          value={text}
          onChange={handleSearchText}
          fullWidth={true}
          placeholder={t('RpcModal-InputPlaceholder')}
        />
        {isDisabled && <div>{t('RpcModal-InvalidRpc')}</div>}
      </div>
      <div className={classes.footer}>
        <Button disabled={isDisabled} onClick={onSave} size="lg" style={{ width: '100%' }}>
          {t('RpcModal-Save')}
        </Button>
      </div>
    </>
  );
});

export const List = memo<RpcStepsProps>(function List({ handleStep, setEditChainId }) {
  const classes = useStyles();
  const chainIds = useAppSelector(selectActiveChainIds);

  const onSelect = useCallback(
    (value: ChainEntity['id']) => {
      //Action to modify step to edit
      setEditChainId(value);
      handleStep(RpcStepEnum.Edit);
    },
    [handleStep, setEditChainId]
  );

  return (
    <div className={classes.list}>
      <SearchableList
        size="sm"
        options={chainIds}
        onSelect={onSelect}
        ItemInnerComponent={ChainListItem}
      />
    </div>
  );
});
