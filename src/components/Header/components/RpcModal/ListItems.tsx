import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import { ChainIcon } from '../../../ChainIcon';
import type { ItemInnerProps } from '../../../SearchableList/ItemInner';
import { useAppSelector } from '../../../../store';
import { selectChainById } from '../../../../features/data/selectors/chains';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const ChainListItem = memo(function ChainListItem({
  value,
}: ItemInnerProps<ChainEntity['id']>) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      <ChainIcon chainId={value} className={classes.listItemIcon} />
      {chain.name}
    </>
  );
});

export const ModifiedListItem = memo(function ChainListItem({
  value,
}: ItemInnerProps<ChainEntity['id']>) {
  const chain = useAppSelector(state => selectChainById(state, value));
  const classes = useStyles();

  // udpate for selector
  const modifiedURL = 'https://rpc.mevblocker.io';

  return (
    <div>
      <div className={classes.modifiedListItem}>
        <ChainIcon chainId={value} />
        {chain.name}
      </div>
      <div className={classes.url}>{modifiedURL}</div>
    </div>
  );
});

export const ModifiedListItemEndComponent = memo(function ChainListItem() {
  const classes = useStyles();

  // add function to delete
  return (
    <>
      <CloseIcon className={classes.cross} />
    </>
  );
});
