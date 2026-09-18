import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../components/TokenAmount/TokenAmount.tsx';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import AutocompoundIcon from '../../../../images/icons/autocompound.svg?react';
import ClaimableIcon from '../../../../images/icons/claimable.svg?react';
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
import {
  OptionBody,
  OptionCard,
  OptionGlyph,
  OptionHeading,
  OptionNote,
  OptionSection,
  OptionTitle,
  OptionTitleRow,
} from './OptionCard.tsx';
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
  /** the withdraw form spaces its blocks with margins */
  css?: CssStyles;
};

/** Withdraw's side picker: one card per held side, in the deposit rewards card's anatomy */
export const ClmModeSelector = memo(function ClmModeSelector({
  css: cssProp,
}: ClmModeSelectorProps) {
  const { t } = useTranslation();
  const clmMode = useClmMode();
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);
  const vaultRetired = useSideRetired(clmMode?.vaultSideId);
  const poolRetired = useSideRetired(clmMode?.poolSideId);
  const vaultHeld = useSideHeld(clmMode?.vaultSideId);
  const poolHeld = useSideHeld(clmMode?.poolSideId);

  const handleSelect = useCallback((mode: ClmMode) => clmMode?.setMode(mode), [clmMode]);

  if (!clmMode) {
    return null;
  }

  // withdraw takes from a position, so only sides actually held are listed, retired or not
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

  const busy = isExecuting || isStepping;

  return (
    <OptionSection className={css(cssProp)}>
      <OptionHeading>{t('Transact-ClmMode-Title')}</OptionHeading>
      {sides.length === 1 ?
        // nothing to choose: the deposit tab's statement card
        <OptionCard busy={busy}>
          <SideRow>
            <OptionGlyph aria-hidden={true}>
              <ModeIcon mode={sides[0].mode} />
            </OptionGlyph>
            <SideContent {...sides[0]} />
          </SideRow>
        </OptionCard>
      : <SideStack>
          {sides.map(side => (
            <SideOption
              key={side.mode}
              {...side}
              group={clmMode.clmId}
              selected={side.mode === clmMode.mode}
              busy={busy}
              onSelect={handleSelect}
            />
          ))}
        </SideStack>
      }
    </OptionSection>
  );
});

const SideOption = memo(function SideOption({
  mode,
  sideId,
  retired,
  group,
  selected,
  busy,
  onSelect,
}: SideProps & {
  group: string;
  selected: boolean;
  busy: boolean;
  onSelect: (mode: ClmMode) => void;
}) {
  const handleChange = useCallback(() => onSelect(mode), [mode, onSelect]);

  return (
    <OptionCard checked={selected} busy={busy}>
      <SideLabel>
        <NativeRadio
          type="radio"
          name={`clm-side-${group}`}
          checked={selected}
          onChange={handleChange}
          disabled={busy}
        />
        <OptionGlyph aria-hidden={true}>
          <Radio checked={selected} />
        </OptionGlyph>
        <SideContent mode={mode} sideId={sideId} retired={retired} />
      </SideLabel>
    </OptionCard>
  );
});

const SideContent = memo(function SideContent({ mode, sideId, retired }: SideProps) {
  const { t } = useTranslation();
  const value = useAppSelector(state =>
    formatLargeUsd(selectUserVaultBalanceInUsdIncludingDisplaced(state, sideId))
  );

  return (
    <OptionBody>
      <OptionTitleRow>
        <OptionTitle>{t(MODE_NAME[mode])}</OptionTitle>
        {retired ?
          <RetiredTag>{t('VaultTag-Retired')}</RetiredTag>
        : null}
        <Value>{value}</Value>
      </OptionTitleRow>
      <OptionNote>
        {retired ? t('Transact-ClmMode-RetiredNote') : <HeldAmount sideId={sideId} />}
      </OptionNote>
    </OptionBody>
  );
});

export const HeldAmount = memo(function HeldAmount({ sideId }: { sideId: VaultEntity['id'] }) {
  const held = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, sideId)
  );
  return (
    <>
      <TokenAmountFromEntity amount={held.amount} token={held.token} /> {held.token.symbol}
    </>
  );
});

export const ModeIcon = memo(function ModeIcon({ mode }: { mode: ClmMode }) {
  return mode === 'vault' ? <Autocompound /> : <Claimable />;
});

function useSideHeld(sideId: VaultEntity['id'] | undefined): boolean {
  return useAppSelector(state =>
    sideId ? selectUserVaultBalanceInUsdIncludingDisplaced(state, sideId).gt(0) : false
  );
}

const SideStack = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

const rowBase = {
  display: 'flex',
  alignItems: 'flex-start',
  paddingBlock: '12px',
  paddingInlineEnd: '12px',
} as const;

const SideRow = styled('div', { base: rowBase });

/** the whole card is the tap target; nothing else in it is interactive */
const SideLabel = styled('label', {
  base: {
    ...rowBase,
    // contains the visually-hidden radio
    position: 'relative',
    cursor: 'pointer',
    // keyboard only: :focus-within would also fire on click and leave a ring behind the cursor
    '&:has(:focus-visible)': {
      outline: 'solid 2px {colors.text.dark}',
      outlineOffset: '-2px',
      borderRadius: '8px',
    },
  },
});

const NativeRadio = styled('input', {
  base: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  },
});

/** drawn to match the checkbox glyph: 20px, 2px green outline, filled mark when selected */
const Radio = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid {colors.green.40}',
  },
  variants: {
    checked: {
      true: {
        _after: {
          content: '""',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'green.40',
        },
      },
    },
  },
});

const Value = styled('span', {
  base: {
    flexShrink: '0',
    marginLeft: 'auto',
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

const iconBase = {
  flex: 'none',
  width: '18px',
  height: '18px',
  color: 'text.light',
} as const;

const Autocompound = styled(AutocompoundIcon, { base: iconBase });

const Claimable = styled(ClaimableIcon, { base: iconBase });
