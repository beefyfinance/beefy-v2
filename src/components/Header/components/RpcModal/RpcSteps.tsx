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
import { ChainListItem, ModifiedListItem, ModifiedListItemEndComponent } from './ListItems';

const useStyles = makeStyles(styles);

export interface RpcStepsProps {
  handleStep: () => void;
}

export const Menu = memo<RpcStepsProps>(function Menu({ handleStep }) {
  const classes = useStyles();
  const { t } = useTranslation();
  //change selector for updated Chains
  const chainIds = ['arbitrum', 'bsc'];

  const onSelect = useCallback(() => {
    //Action to delete
  }, []);

  return (
    <>
      {chainIds.length > 0 ? (
        <div className={clsx(classes.flexGrow, classes.list)}>
          <SearchableList
            options={chainIds}
            onSelect={onSelect}
            ItemInnerComponent={ModifiedListItem}
            EndComponent={ModifiedListItemEndComponent}
          />
        </div>
      ) : (
        <div className={classes.flexGrow}>{t('RpcEdit-NoModified')}</div>
      )}
      <div className={classes.footer}>
        <Button onClick={handleStep} variant="success" size="sm" style={{ width: '100%' }}>
          {t('RpcEdit-Add')}
        </Button>
      </div>
    </>
  );
});

export const Edit = memo<RpcStepsProps>(function Edit({ handleStep }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, 'arbitrum'));
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
    handleStep();
  }, [handleStep]);

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
        <Button
          disabled={isDisabled}
          onClick={onSave}
          variant="success"
          size="sm"
          style={{ width: '100%' }}
        >
          {t('RpcModal-Save')}
        </Button>
      </div>
    </>
  );
});

export const List = memo<RpcStepsProps>(function List({ handleStep }) {
  const classes = useStyles();
  const chainIds = useAppSelector(selectActiveChainIds);

  const onSelect = useCallback(() => {
    //Action to modify step to edit
    handleStep();
  }, [handleStep]);

  return (
    <div className={classes.list}>
      <SearchableList options={chainIds} onSelect={onSelect} ItemInnerComponent={ChainListItem} />
    </div>
  );
});
