import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTokenList } from '../../../../helpers/format.ts';
import { useLocalStorageBoolean } from '../../../../helpers/useLocalStorageBoolean.ts';
import CheckBoxIcon from '../../../../images/icons/CheckBox.svg?react';
import CheckBoxBlankIcon from '../../../../images/icons/CheckBoxBlank.svg?react';
import ExpandMoreIcon from '../../../../images/icons/mui/ExpandMore.svg?react';
import { selectClmPayoutTokens } from '../../../data/selectors/apy.ts';
import { selectIsStepperStepping } from '../../../data/selectors/stepper.ts';
import { selectTransactExecuting } from '../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { useClmMode } from './ClmModeContext.tsx';
import { resolveClmRewardsVariant } from './clm-rewards.ts';

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
  // name what each side pays out in: users choose an asset, not a mechanism
  const payout = useAppSelector(state =>
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

  const checked = variant === 'info' || clmMode.mode === 'vault';
  const busy = isExecuting || isStepping;
  const title = variant === 'info' ? 'Transact-ClmRewards-Info' : 'Transact-ClmRewards-Option';
  // fees-only groups have no claim token to name; fall back to the generic wording
  const hasRewardToken = !!payout && payout.claim.length > 0;
  const subLine =
    variant === 'info' ?
      hasRewardToken ? 'Transact-ClmRewards-Info-Note'
      : 'Transact-ClmRewards-Info-Note-Generic'
    : checked ?
      hasRewardToken ? 'Transact-ClmRewards-On-Note'
      : 'Transact-ClmRewards-On-Note-Generic'
    : hasRewardToken ? 'Transact-ClmRewards-Off-Note'
    : 'Transact-ClmRewards-Off-Note-Generic';
  const tokens = {
    position: payout?.compound.join('-') ?? '',
    reward: payout ? formatTokenList(payout.claim) : '',
  };

  // identical in both variants, so the title starts at the same offset whether the glyph sits in
  // an interactive halo beside the disclosure or inside it
  const content = (
    <Column>
      <TitleRow>
        <Title>{t(title)}</Title>
        <Chevron open={expanded}>
          <ExpandMoreIcon />
        </Chevron>
      </TitleRow>
      {expanded ? null : <SubLine>{t(subLine, tokens)}</SubLine>}
    </Column>
  );

  return (
    <Section className={css(cssProp)}>
      <Heading>{t('Transact-ClmRewards-Title')}</Heading>
      <Card checked={checked} busy={busy}>
        {variant === 'info' ?
          // a statement, not a control: the whole row is one expand target, no dead taps
          <Disclosure
            type="button"
            onClick={handleExpand}
            aria-expanded={expanded}
            expanded={expanded}
          >
            <GlyphBox aria-hidden={true}>
              <CheckBoxIcon />
            </GlyphBox>
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
              />
              <GlyphBox aria-hidden={true}>
                {checked ?
                  <CheckBoxIcon />
                : <CheckBoxBlankIcon />}
              </GlyphBox>
            </Halo>
            <Disclosure
              type="button"
              onClick={handleExpand}
              aria-expanded={expanded}
              expanded={expanded}
            >
              {content}
            </Disclosure>
          </Row>
        }
        {expanded ?
          <Expansion>
            {variant === 'info' ?
              <>
                <p>
                  {t(
                    hasRewardToken ?
                      'Transact-ClmRewards-Info-Explainer'
                    : 'Transact-ClmRewards-Info-Explainer-Generic',
                    tokens
                  )}
                </p>
                <p>{t('Transact-ClmRewards-Info-Explainer-2')}</p>
              </>
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
              </>
            }
          </Expansion>
        : null}
      </Card>
    </Section>
  );
});

const Section = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

const Heading = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.dark',
  },
});

const Card = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    border: '1px solid {colors.background.content.light}',
    backgroundColor: 'background.content.dark',
  },
  variants: {
    checked: {
      true: {
        borderColor: 'transparent',
        backgroundColor: 'background.content.light',
      },
    },
    busy: {
      true: {
        opacity: '0.45',
        pointerEvents: 'none',
      },
    },
  },
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

/** fixed 44px gutter so the title starts at the same offset in every variant */
const GlyphBox = styled('div', {
  base: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '44px',
    color: 'green.40',
  },
});

const Column = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: '1',
    minWidth: '0',
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
    paddingBlockStart: '12px',
    paddingBlockEnd: '12px',
    paddingInlineEnd: '12px',
    _focusVisible: {
      outline: 'solid 2px {colors.text.dark}',
      outlineOffset: '-2px',
      borderRadius: '8px',
    },
  },
  variants: {
    expanded: {
      true: { paddingBlockEnd: '4px' },
    },
  },
});

const TitleRow = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
  },
});

const Title = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
    flexGrow: '1',
  },
});

const SubLine = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    textWrap: 'pretty',
  },
});

const Chevron = styled('span', {
  base: {
    display: 'flex',
    flexShrink: '0',
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

const Expansion = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    // one text column: the sub-line it replaces starts under the title, not the glyph
    paddingInlineStart: '44px',
    paddingInlineEnd: '12px',
    paddingBlockEnd: '12px',
  },
});
