import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { ItemInnerProps } from '../../../../../../components/SearchableList/ItemInner';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { ChainIcon } from '../ChainIcon';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const ListItem = memo<ItemInnerProps>(function ({ value }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      <ChainIcon chainId={value} className={classes.listItemIcon} />
      {chain.name}
    </>
  );
});
