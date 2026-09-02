import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../components/TokenAmount/TokenAmount.tsx';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import AutocompoundIcon from '../../../../images/icons/autocompound.svg?react';
import ClaimableIcon from '../../../../images/icons/claimable.svg?react';
import ExpandMoreIcon from '../../../../images/icons/mui/ExpandMore.svg?react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../../../data/selectors/balance.ts';
import { selectIsStepperStepping } from '../../../data/selectors/stepper.ts';
import { selectTransactExecuting } from '../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { useClmMode } from './ClmModeContext.tsx';
import { useSideRetired } from './hooks.ts';
import type { ClmMode } from './resolve-clm-mode.ts';

const MODE_NAME: Record<ClmMode, string> = {
  vault: 'Transact-ClmMode-Vault',
  pool: 'Transact-ClmMode-Pool',
};

type SideProps = {
  mode: ClmMode;
  sideId: VaultEntity['id'];
  retired: boolean;
};

type ClmModeSelectorProps = {
  /** the withdraw form spaces its blocks with margins; the deposit form uses a row gap */
  css?: CssStyles;
};

export const ClmModeSelector = memo(function ClmModeSelector({
  css: cssProp,
}: ClmModeSelectorProps) {
  const { t } = useTranslation();
  const clmMode = useClmMode();
  const [open, setOpen] = useState(false);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);
  const vaultRetired = useSideRetired(clmMode?.vaultSideId);
  const poolRetired = useSideRetired(clmMode?.poolSideId);
  const vaultHeld = useSideHeld(clmMode?.vaultSideId);
  const poolHeld = useSideHeld(clmMode?.poolSideId);

  const handleToggle = useCallback(() => setOpen(prev => !prev), []);
  const handleSelect = useCallback(
    (mode: ClmMode) => {
      setOpen(false);
      clmMode?.setMode(mode);
    },
    [clmMode]
  );

  if (!clmMode) {
    return null;
  }

  // deposit asks where new funds go, so retired sides are absent; withdraw asks which position to
  // take from, so it lists only sides actually held
  const sides: SideProps[] = (
    [
      { mode: 'vault', sideId: clmMode.vaultSideId, retired: vaultRetired, held: vaultHeld },
      { mode: 'pool', sideId: clmMode.poolSideId, retired: poolRetired, held: poolHeld },
    ] as const
  ).flatMap(side =>
    side.sideId && side.held ?
      [{ mode: side.mode, sideId: side.sideId, retired: side.retired }]
    : []
  );

  if (!sides.length) {
    return null;
  }

  const disabled = isExecuting || isStepping;
  const single = sides.length < 2;
  const expanded = open && !single && !disabled;

  return (
    <div className={css(cssProp)}>
      <Trigger
        type="button"
        interactive={!single}
        dimmed={disabled}
        disabled={disabled || single}
        onClick={handleToggle}
      >
        <TriggerInfo>
          <EyebrowLine>
            <Eyebrow>{t('Transact-ClmMode-Label')}</Eyebrow>
          </EyebrowLine>
          <TriggerLine>
            <ModeIcon mode={clmMode.mode} />
            <TriggerName>{t(MODE_NAME[clmMode.mode])}</TriggerName>
            <TriggerValue>
              <SideValue sideId={clmMode.selectedVaultId} suffix={true} />
            </TriggerValue>
          </TriggerLine>
        </TriggerInfo>
        {single ? null : <Chevron open={expanded} />}
      </Trigger>
      {expanded ?
        <Panel>
          {sides.map(side => (
            <ModeOption
              key={side.mode}
              {...side}
              selected={side.mode === clmMode.mode}
              onSelect={handleSelect}
            />
          ))}
        </Panel>
      : null}
    </div>
  );
});

const ModeOption = memo(function ModeOption({
  mode,
  sideId,
  retired,
  selected,
  onSelect,
}: SideProps & {
  selected: boolean;
  onSelect: (mode: ClmMode) => void;
}) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onSelect(mode), [mode, onSelect]);

  return (
    <Option type="button" selected={selected} retired={retired} onClick={handleClick}>
      <OptionHead>
        <OptionLeft>
          <ModeIcon mode={mode} />
          <OptionName>{t(MODE_NAME[mode])}</OptionName>
          {retired ?
            <RetiredTag>{t('VaultTag-Retired')}</RetiredTag>
          : null}
        </OptionLeft>
        <OptionValue>
          <SideValue sideId={sideId} suffix={false} />
        </OptionValue>
      </OptionHead>
      <Receive>
        <ReceiveContent sideId={sideId} retired={retired} />
      </Receive>
    </Option>
  );
});

/** APY/APR on deposit, deposited USD on withdraw */
const SideValue = memo(function SideValue({
  sideId,
  suffix,
}: {
  sideId: VaultEntity['id'];
  suffix: boolean;
}) {
  const { t } = useTranslation();
  const value = useAppSelector(state =>
    formatLargeUsd(selectUserVaultBalanceInUsdIncludingDisplaced(state, sideId))
  );

  if (!value) {
    return null;
  }
  return <>{suffix ? t('Transact-ClmMode-Deposited', { value }) : value}</>;
});

/** what the user holds on this side, shown while withdrawing */
const ReceiveContent = memo(function ReceiveContent({
  sideId,
  retired,
}: {
  sideId: VaultEntity['id'];
  retired: boolean;
}) {
  const { t } = useTranslation();
  const held = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, sideId)
  );

  return retired ?
      <>{t('Transact-ClmMode-RetiredNote')}</>
    : <TokenAmountFromEntity amount={held.amount} token={held.token} />;
});

const ModeIcon = memo(function ModeIcon({ mode }: { mode: ClmMode }) {
  return mode === 'vault' ? <Autocompound /> : <Claimable />;
});

function useSideHeld(sideId: VaultEntity['id'] | undefined): boolean {
  return useAppSelector(state =>
    sideId ? selectUserVaultBalanceInUsdIncludingDisplaced(state, sideId).gt(0) : false
  );
}

const Trigger = styled('button', {
  base: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
    padding: '11px 14px',
    borderRadius: '8px',
    backgroundColor: 'background.button',
    cursor: 'default',
  },
  variants: {
    interactive: {
      true: {
        cursor: 'pointer',
        _hover: {
          backgroundColor: 'background.content.light',
        },
      },
    },
    dimmed: {
      true: {
        opacity: '0.45',
        pointerEvents: 'none',
      },
    },
  },
});

const TriggerInfo = styled('span', {
  base: {
    minWidth: 0,
  },
});

const EyebrowLine = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
});

const Eyebrow = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const TriggerLine = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const TriggerName = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const TriggerValue = styled('span', {
  base: {
    textStyle: 'body.md',
    color: 'text.middle',
  },
});

const iconBase = {
  flex: 'none',
  width: '18px',
  height: '18px',
  color: 'text.light',
} as const;

const Autocompound = styled(AutocompoundIcon, { base: iconBase });

const Claimable = styled(ClaimableIcon, { base: iconBase });

const Chevron = styled(ExpandMoreIcon, {
  base: {
    flex: 'none',
    width: '20px',
    height: '20px',
    color: 'text.light',
    transition: 'transform 0.15s ease-in-out',
  },
  variants: {
    open: {
      true: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

const Panel = styled('div', {
  base: {
    display: 'grid',
    gap: '4px',
    marginTop: '4px',
    padding: '6px',
    borderRadius: '8px',
    border: '2px solid {colors.background.content.light}',
    backgroundColor: 'background.content',
  },
});

const Option = styled('button', {
  base: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease-in-out',
    _hover: {
      backgroundColor: 'background.content.light',
    },
  },
  variants: {
    selected: {
      true: {
        backgroundColor: 'background.button',
        _hover: {
          backgroundColor: 'background.content.light',
        },
      },
    },
    retired: {
      true: {
        boxShadow: 'inset 0 0 0 1px {colors.tags.retired.background}',
      },
    },
  },
});

const OptionHead = styled('span', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
});

const OptionLeft = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
});

const OptionName = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const OptionValue = styled('span', {
  base: {
    flex: 'none',
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const RetiredTag = styled('span', {
  base: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 6px',
    borderRadius: '4px',
    textStyle: 'body.sm.medium',
    backgroundColor: 'tags.retired.background',
    color: 'text.light',
  },
});

const Receive = styled('span', {
  base: {
    display: 'block',
    marginTop: '3px',
    textStyle: 'body.sm',
    color: 'text.dark',
    whiteSpace: 'normal',
  },
});
