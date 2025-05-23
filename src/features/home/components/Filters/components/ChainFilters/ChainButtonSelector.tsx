import { css, cx } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { NewBadge } from '../../../../../../components/Header/components/Badges/NewBadge.tsx';
import { ButtonWithTooltip } from '../../../../../../components/Tooltip/ButtonWithTooltip.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity, ChainId } from '../../../../../data/entities/chain.ts';
import { selectActiveChainIds, selectChainById } from '../../../../../data/selectors/chains.ts';
import { getNetworkIcon } from './hooks.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type ChainButtonProps = {
  id: ChainEntity['id'];
  selected: boolean;
  onChange: (selected: boolean, id: ChainEntity['id']) => void;
  allSelected?: boolean;
};
const ChainButton = memo(function ChainButton({
  id,
  selected,
  onChange,
  allSelected,
}: ChainButtonProps) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, id));
  const handleChange = useCallback(() => {
    onChange(!selected, id);
  }, [id, selected, onChange]);
  const Icon = getNetworkIcon(id);

  const isAllSelected = allSelected || selected;

  return (
    <ButtonWithTooltip
      openOnClick={false}
      tooltip={chain.name}
      placement="top"
      onClick={handleChange}
      className={css(styles.button, isAllSelected && styles.selected, selected && styles.active)}
      variant="dark"
    >
      {chain.new ?
        <NewBadge css={styles.badge} />
      : null}
      <Icon
        className={cx(classes.icon, !isAllSelected && classes.unselectedIcon)}
        width={24}
        height={24}
      />
    </ButtonWithTooltip>
  );
});

export type ChainButtonSelectorProps = {
  selected: ChainEntity['id'][];
  onChange: (selected: ChainEntity['id'][]) => void;
};
export const ChainButtonSelector = memo(function ChainButtonSelector({
  selected,
  onChange,
}: ChainButtonSelectorProps) {
  const chainIds = useAppSelector(selectActiveChainIds);
  const handleChange = useCallback(
    (isSelected: boolean, id: ChainId) => {
      if (isSelected) {
        if (!selected.includes(id)) {
          const newSelected = [...selected, id];
          // if all selected, return empty array to represent not-filtered
          onChange(newSelected.length < chainIds.length ? newSelected : []);
        }
      } else if (!isSelected) {
        if (selected.length === 0) {
          // special handling:
          // first chain unselected should be treated as unselecting all other chains instead
          onChange([id]);
        } else if (selected.includes(id)) {
          onChange(selected.filter(selectedId => selectedId !== id));
        }
      }
    },
    [chainIds, selected, onChange]
  );

  return (
    <Buttons>
      {chainIds.map(id => (
        <ChainButton
          key={id}
          id={id}
          selected={selected.includes(id)}
          onChange={handleChange}
          allSelected={selected.length === 0}
        />
      ))}
    </Buttons>
  );
});

const Buttons = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    columnGap: '0',
    rowGap: '16px',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: 'background.content',
    borderRadius: '8px',
    backgroundColor: 'background.content.dark',
  },
});
