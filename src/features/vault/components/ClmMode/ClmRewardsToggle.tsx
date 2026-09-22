import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTokenList } from '../../../../helpers/format.ts';
import { useLocalStorageBoolean } from '../../../../helpers/useLocalStorageBoolean.ts';
import CheckBoxIcon from '../../../../images/icons/CheckBox.svg?react';
import CheckBoxBlankIcon from '../../../../images/icons/CheckBoxBlank.svg?react';
import ExpandMoreIcon from '../../../../images/icons/mui/ExpandMore.svg?react';
import {
  formatApyUIRate,
  selectApyVaultUIData,
  selectClmPayoutTokens,
} from '../../../data/selectors/apy.ts';
import { selectIsStepperStepping } from '../../../data/selectors/stepper.ts';
import { selectTransactExecuting } from '../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { type ClmModeContextValue, useClmMode } from './ClmModeContext.tsx';
import { ModeIcon } from './ClmModeSelector.tsx';
import { resolveClmRewardsVariant } from './clm-rewards.ts';
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

/** first-ever view of the control opens it; every later view is collapsed */
const SEEN_STORAGE_KEY = 'clmRewardsSeen';

const warnedGroups = new Set<string>();

/**
 * Where a depositor chooses which wrapper receives the deposit, or — on pool-only CLMs — where the
 * product's reward behaviour is stated. Shape, labels and default come from contract structure
 * alone: the choice is a standing instruction about who collects rewards that may only start
 * later, so what happens to be streaming today must not change it.
 */
export const ClmRewardsToggle = memo(function ClmRewardsToggle({
  css: cssProp,
}: {
  css?: CssStyles;
}) {
  const { t } = useTranslation();
  const clmMode = useClmMode();
  const [seen, setSeen] = useLocalStorageBoolean(SEEN_STORAGE_KEY, false);
  const [expanded, setExpanded] = useState(() => !seen);
  const isExecuting = useAppSelector(selectTransactExecuting);
  // name what the CLM pays out in: users choose an asset, not a mechanism
  const payoutTokens = useAppSelector(state =>
    clmMode ? selectClmPayoutTokens(state, clmMode.clmId) : undefined
  );
  const isStepping = useAppSelector(selectIsStepperStepping);

  useEffect(() => {
    if (!seen) {
      setSeen(true);
    }
  }, [seen, setSeen]);

  const handleToggle = useCallback(
    () => clmMode?.setMode(clmMode.mode === 'vault' ? 'pool' : 'vault'),
    [clmMode]
  );
  const handleExpand = useCallback(() => setExpanded(prev => !prev), []);

  if (!clmMode) {
    return null;
  }

  const variant = resolveClmRewardsVariant(clmMode.ids);
  if (!clmMode.ids.pool && !warnedGroups.has(clmMode.clmId)) {
    warnedGroups.add(clmMode.clmId);
    console.warn(`CLM ${clmMode.clmId} has no active pool wrapper; rewards row has no off state`);
  }

  const checked = variant === 'toggle' && clmMode.mode === 'vault';
  const busy = isExecuting || isStepping;
  const title = variant === 'info' ? 'Transact-ClmRewards-Info' : 'Transact-ClmRewards-Option';
  // fees-only groups have no reward token to name; fall back to the generic wording
  const hasRewardToken = !!payoutTokens && payoutTokens.length > 0;
  // fees are the main yield and they always compound; only name a handling when a token streams
  const subLine =
    !hasRewardToken ? 'Transact-ClmRewards-Note-FeesOnly'
    : variant === 'info' ? 'Transact-ClmRewards-Info-Note'
    : checked ? 'Transact-ClmRewards-On-Note'
    : 'Transact-ClmRewards-Off-Note';
  const tokens = { reward: payoutTokens ? formatTokenList(payoutTokens) : '' };

  // identical in both variants, so the title starts at the same offset whether the glyph sits in
  // an interactive halo beside the disclosure or inside it
  const explainer =
    variant === 'info' ?
      <p>
        {t(
          hasRewardToken ?
            'Transact-ClmRewards-Info-Explainer'
          : 'Transact-ClmRewards-Info-Explainer-Generic',
          tokens
        )}
      </p>
    : <>
        <p>{t('Transact-ClmRewards-Explainer')}</p>
        <p>
          {t(
            hasRewardToken ?
              'Transact-ClmRewards-Explainer-On'
            : 'Transact-ClmRewards-Explainer-On-Generic',
            tokens
          )}
        </p>
        <p>
          {t(
            hasRewardToken ?
              'Transact-ClmRewards-Explainer-Off'
            : 'Transact-ClmRewards-Explainer-Off-Generic',
            tokens
          )}
        </p>
      </>;

  const content = (
    <OptionBody>
      <OptionTitleRow>
        <OptionTitle>{t(title)}</OptionTitle>
        <Chevron open={expanded}>
          <ExpandMoreIcon />
        </Chevron>
      </OptionTitleRow>
      {expanded ?
        <Expansion>{explainer}</Expansion>
      : <OptionNote>{t(subLine, tokens)}</OptionNote>}
    </OptionBody>
  );

  return (
    <OptionSection className={css(cssProp)}>
      <OptionHeading>
        {t('Transact-ClmRewards-Title')}
        {variant === 'toggle' ?
          <RewardsRate ids={clmMode.ids} checked={checked} />
        : null}
      </OptionHeading>
      <OptionCard checked={checked} busy={busy}>
        {variant === 'info' ?
          // a statement, not a control: one expand target, and a mode icon so it can't read as a stuck tick
          <Disclosure
            type="button"
            onClick={handleExpand}
            aria-expanded={expanded}
            aria-label={t(title)}
            disabled={busy}
          >
            <OptionGlyph aria-hidden={true}>
              <ModeIcon mode="vault" />
            </OptionGlyph>
            {content}
          </Disclosure>
        : <Row>
            {/* the glyph and its halo are the only thing that reroutes money; the rest of the row
                expands, so an ambiguous tap resolves to the free action */}
            <Halo>
              <NativeCheckbox
                type="checkbox"
                checked={checked}
                onChange={handleToggle}
                aria-label={t(title)}
                disabled={busy}
              />
              <OptionGlyph aria-hidden={true}>
                {checked ?
                  <CheckBoxIcon />
                : <CheckBoxBlankIcon />}
              </OptionGlyph>
            </Halo>
            <Disclosure
              type="button"
              onClick={handleExpand}
              aria-expanded={expanded}
              aria-label={t(title)}
              disabled={busy}
            >
              {content}
            </Disclosure>
          </Row>
        }
      </OptionCard>
    </OptionSection>
  );
});

type RewardsRateProps = {
  ids: ClmModeContextValue['ids'];
  checked: boolean;
};

/**
 * What the route the tick selects pays today. The header states the product's headline rate; this
 * states the depositor's own, which is a different number whenever the two wrappers disagree.
 */
const RewardsRate = memo(function RewardsRate({ ids, checked }: RewardsRateProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state =>
    ids.vault ? selectApyVaultUIData(state, ids.vault) : undefined
  );
  const poolData = useAppSelector(state =>
    ids.pool ? selectApyVaultUIData(state, ids.pool) : undefined
  );
  const rate = formatApyUIRate(checked ? vaultData : poolData);

  if (!rate) {
    return null;
  }

  return (
    <Rate>
      {rate.value} <RateKind>{t(rate.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY')}</RateKind>
    </Rate>
  );
});

/** the depositor's rate reads as a value, not a status: same neutral text as the card above it */
const Rate = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
});

const RateKind = styled('span', {
  base: { textStyle: 'body.medium', color: 'text.dark' },
});

const Row = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
  },
});

/** 44x44 tap target: 20px glyph plus the 12px block padding that also aligns it to the title */
const Halo = styled('label', {
  base: {
    display: 'grid',
    placeItems: 'center',
    // contains the visually-hidden checkbox
    position: 'relative',
    flexShrink: '0',
    paddingBlock: '12px',
    cursor: 'pointer',
    // keyboard only: :focus-within would also fire on click and leave a ring behind the cursor
    '&:has(:focus-visible)': {
      outline: 'solid 2px {colors.text.dark}',
      outlineOffset: '-4px',
      borderRadius: '8px',
    },
  },
});

const NativeCheckbox = styled('input', {
  base: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  },
});

const Disclosure = styled('button', {
  base: {
    display: 'flex',
    flexGrow: '1',
    // a button centres its own content, which would centre both the title row and the sub-line
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    cursor: 'pointer',
    paddingBlock: '12px',
    paddingInlineEnd: '12px',
    _focusVisible: {
      outline: 'solid 2px {colors.text.dark}',
      outlineOffset: '-2px',
      borderRadius: '8px',
    },
  },
});

const Chevron = styled('span', {
  base: {
    display: 'flex',
    flexShrink: '0',
    marginLeft: 'auto',
    color: 'text.dark',
    transition: 'transform 0.2s ease-in-out',
  },
  variants: {
    open: {
      true: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

/** sits where the sub-line does, so the title-to-copy gap is the same open or closed */
const Expansion = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    // the disclosure is a button, and its reset would keep these paragraphs on one line
    textWrap: 'pretty',
  },
});
