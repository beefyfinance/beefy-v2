import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import InfoIcon from '../../../../../images/icons/navigation/resources.svg?react';
import { StatLoader } from '../../../../../components/StatLoader/StatLoader.tsx';

export type StatProps = {
  label: string;
  value: string;
  blurred?: boolean;
  loading?: boolean;
  onInfo?: () => void;
};

export const Stat = memo<StatProps>(function UserStat({
  label,
  value,
  onInfo,
  loading = false,
  blurred = false,
}) {
  return (
    <StatContainer>
      <Value blurred={!loading && blurred}>
        {loading ?
          <StatLoader />
        : blurred ?
          '$100'
        : value}
      </Value>
      <Label>
        {label}
        {onInfo && (
          <button type="button" onClick={onInfo}>
            <InfoIconComponent />
          </button>
        )}
      </Label>
    </StatContainer>
  );
});

const InfoIconComponent = styled(InfoIcon, {
  base: {
    width: '12px',
    height: '12px',
  },
});

const StatContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    padding: '8px 18px',
    borderRadius: '8px',
    width: '100%',
  },
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm.semiBold',
    color: 'text.dark',
    display: 'inline-flex',
    gap: '4px',
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'h4',
    color: 'text.light',
  },
  variants: {
    blurred: {
      true: {
        filter: 'blur(.5rem)',
        userSelect: 'none',
      },
    },
  },
});
