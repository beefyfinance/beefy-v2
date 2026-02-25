import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import { formatLargeUsd } from '../../../../../../../../helpers/format.ts';
import { useCollapse } from '../../../../../../../../components/Collapsable/hooks.ts';
import { useTranslation } from 'react-i18next';

export type DustListProps = {
  children: ReactNode;

  dustTotalUsd: BigNumber;
};

export const DustList = memo(function DustList({ children, dustTotalUsd }: DustListProps) {
  const { t } = useTranslation();
  const [isDustHovered, setIsDustHovered] = useState(false);
  const {
    open: dustExpanded,
    handleToggle: toggleDustExpanded,
    Icon: DustIcon,
  } = useCollapse(false);

  const dustTitle = useMemo(() => {
    return (
      dustExpanded ?
        isDustHovered ? `Hide ${t('Transact-TokenSelect-LowValueTokens')}`
        : t('Transact-TokenSelect-LowValueTokens')
      : `Show ${t('Transact-TokenSelect-LowValueTokens')}`
    );
  }, [dustExpanded, isDustHovered, t]);

  const handleMouseEnter = useCallback(() => {
    setIsDustHovered(true);
  }, [setIsDustHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsDustHovered(false);
  }, [setIsDustHovered]);

  return (
    <DustSection>
      <DustHeader
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleDustExpanded}
      >
        <DustTitle hovered={isDustHovered}>{dustTitle}</DustTitle>
        <DustRight>
          <DustSum>{formatLargeUsd(dustTotalUsd)}</DustSum>
          <DustIconWrapper active={dustExpanded || isDustHovered}>
            <DustIcon />
          </DustIconWrapper>
        </DustRight>
      </DustHeader>
      {dustExpanded && children}
    </DustSection>
  );
});

const DustSection = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const DustHeader = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    width: '100%',
    padding: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    userSelect: 'none',
    textStyle: 'body.medium',
    height: '44px',
  },
});

const DustTitle = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flexGrow: 1,
    color: 'text.dark',
    transition: 'color 0.2s',
  },
  variants: {
    hovered: {
      true: {
        color: 'text.light',
      },
    },
  },
});

const DustRight = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'text.dark',
  },
});

const DustSum = styled('span', {
  base: {
    color: 'text.dark',
  },
});

const DustIconWrapper = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    color: 'text.dark',
    transition: 'color 0.2s',
  },
  variants: {
    active: {
      true: {
        color: 'text.light',
      },
    },
  },
});
