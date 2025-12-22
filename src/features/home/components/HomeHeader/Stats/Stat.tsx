import { memo, type ReactNode } from 'react';
import { styled } from '@repo/styles/jsx';
import InfoIcon from '../../../../../images/icons/i.svg?react';
import { StatLoader } from '../../../../../components/StatLoader/StatLoader.tsx';
import { DivWithTooltip } from '../../../../../components/Tooltip/DivWithTooltip.tsx';

export type StatProps = {
  label: string | ReactNode;
  value: string | ReactNode;
  tooltip?: string;
  blurred?: boolean;
  loading?: boolean;
  onInfo?: () => void;
  onClick?: () => void;
};

export const Stat = memo<StatProps>(function UserStat({
  label,
  value,
  tooltip,
  onClick,
  loading = false,
  blurred = false,
}) {
  return (
    <StatContainer>
      <Value onClick={onClick} blurred={!loading && blurred}>
        {loading ?
          <StatLoader />
        : blurred ?
          '$100'
        : value}
      </Value>
      <Label>
        {label}
        {tooltip && (
          <Tooltip placement="bottom-start" tooltip={tooltip}>
            <InfoIconComponent />
          </Tooltip>
        )}
      </Label>
    </StatContainer>
  );
});

const Tooltip = styled(DivWithTooltip, {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    _hover: {
      cursor: 'pointer',
      color: 'text.middle',
    },
  },
});

const InfoIconComponent = styled(InfoIcon, {
  base: {
    width: '10px',
    height: '10px',
  },
});

const StatContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.darkest',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    sm: {
      paddingInline: '18px',
      gap: '1px',
    },
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
    textStyle: 'h3',
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
