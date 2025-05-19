import { memo, useMemo } from 'react';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { getUnixNow } from '../../../helpers/date.ts';
import { formatTokenDisplayCondensed } from '../../../helpers/format.ts';
import { useAppSelector } from '../../data/store/hooks.ts';
import {
  selectBeGemsSeason,
  selectBeGemsSeasonData,
} from '../../data/selectors/campaigns/begems.ts';
import { Tab } from './components/tabs/Tab.tsx';
import { Tabs, TabsShadow } from './components/tabs/Tabs.tsx';

type SeasonTabsProps = {
  selected: number;
  onChange: (selected: number) => void;
  options: number[];
};

export const SeasonTabs = memo(function SeasonTabs({
  selected,
  options,
  onChange,
}: SeasonTabsProps) {
  return (
    <TabsShadow>
      <Tabs>
        {options.map(option => (
          <SeasonTab
            key={option}
            value={option}
            onChange={onChange}
            selected={selected === option}
          />
        ))}
      </Tabs>
    </TabsShadow>
  );
});

type SeasonTabProps = {
  value: number;
  onChange: (selected: number) => void;
  selected: boolean;
};

const SeasonTab = memo(function SeasonTab({ value, onChange, selected }: SeasonTabProps) {
  const config = useAppSelector(state => selectBeGemsSeason(state, value));
  const data = useAppSelector(state => selectBeGemsSeasonData(state, value));
  const subLabel = useMemo(() => {
    if (data.priceForFullShare?.gt(BIG_ZERO)) {
      return `beGEMS${value} \u200B=\u00A0${formatTokenDisplayCondensed(data.priceForFullShare, 18, 4)}\u00A0S`;
    }
    return `beGEMS${value}`;
  }, [data, value]);
  const disabled = useMemo(() => !data.token && getUnixNow() < config.startTime, [config, data]);

  return (
    <Tab
      value={value}
      label={`Season ${value}`}
      subLabel={subLabel}
      onChange={onChange}
      selected={selected}
      disabled={disabled}
    />
  );
});
