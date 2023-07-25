import type { BeefyState } from '../../../redux-types';

export function selectTooltipIsOpen(state: BeefyState, id: string, group: string = 'default') {
  return state.ui.tooltips.byGroup[group] === id;
}
