import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectActiveChainIds, selectChainById } from '../../../../features/data/selectors/chains';
import { SearchableList } from '../../../SearchableList';
import { useTranslation } from 'react-i18next';
import { getNetworkSrc } from '../../../../helpers/networkSrc';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import { ChainListItem } from '../../../../features/bridge/components/Bridge/components/ListItem';
import { Button } from '../../../Button';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

export const Menu = memo(function Menu() {
  const classes = useStyles();
  const { t } = useTranslation();
  const chainIds = useAppSelector(selectActiveChainIds);
  return (
    <>
      {chainIds.length > 0 ? (
        <div className={classes.list}>
          <SearchableList
            options={chainIds}
            onSelect={() => {}}
            ItemInnerComponent={ChainListItem}
          />
        </div>
      ) : (
        <div>{t('RpcEdit-NoModified')}</div>
      )}
      <div>
        <Button variant="success" size="sm">
          {t('RpcEdit-Add')}
        </Button>
      </div>
    </>
  );
});

export const Edit = memo(function Edit({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <>
      <img src={getNetworkSrc(chain.id)} /> {chain.name}
      <input />
      <button>save</button>
    </>
  );
});

export const List = memo(function List() {
  const chainIds = useAppSelector(selectActiveChainIds);
  return (
    <div>
      <SearchableList options={chainIds} onSelect={() => {}} />
    </div>
  );
});
