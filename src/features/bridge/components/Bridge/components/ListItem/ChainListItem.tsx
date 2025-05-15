import { memo } from 'react';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { styles } from './styles.ts';

export const ChainListItem = memo(function ChainListItem({
  value,
}: ItemInnerProps<ChainEntity['id']>) {
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      <ChainIcon chainId={value} css={styles.listItemIcon} />
      {chain.name}
    </>
  );
});
