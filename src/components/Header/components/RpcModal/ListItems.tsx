import { makeStyles } from '@material-ui/core';
import { memo, useCallback, type MouseEventHandler, useMemo } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import { ChainIcon } from '../../../ChainIcon';
import type { ItemInnerProps } from '../../../SearchableList/ItemInner';
import { useAppSelector } from '../../../../store';
import {
  selectActiveRpcUrlForChain,
  selectChainById,
} from '../../../../features/data/selectors/chains';
import Refresh from '@material-ui/icons/Refresh';
import { styles } from './styles';
import { useDispatch } from 'react-redux';
import { restoreDefaultRpcsOnSingleChain } from '../../../../features/data/actions/chains';

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

  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain.id));

  return (
    <div>
      <div className={classes.modifiedListItem}>
        <ChainIcon chainId={value} />
        {chain.name}
      </div>
      <div className={classes.url}>{activeChainRpc[0]}</div>
    </div>
  );
});

export const ModifiedListItemEndComponent = memo(function ChainListItem({
  value: chain,
}: ItemInnerProps<ChainEntity['id']>) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain));
  const defaultRPC = useAppSelector(state => selectChainById(state, chain)).rpc;

  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      dispatch(restoreDefaultRpcsOnSingleChain(chain));
    },
    [dispatch, chain]
  );

  const rpcsAreEqual = useMemo(
    () =>
      activeChainRpc.length === defaultRPC.length &&
      activeChainRpc.every((url, index) => url === defaultRPC[index]),
    [activeChainRpc, defaultRPC]
  );

  if (rpcsAreEqual) return <></>;

  return (
    <div onClick={handleClick}>
      <Refresh className={classes.cross} />
    </div>
  );
});
