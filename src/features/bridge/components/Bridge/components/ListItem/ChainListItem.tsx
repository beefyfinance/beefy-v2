import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/ItemInner';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { styles } from './styles';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { ChainIcon } from '../../../../../../components/ChainIcon';

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
