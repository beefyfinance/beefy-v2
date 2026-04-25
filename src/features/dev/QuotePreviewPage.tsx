import BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { styled } from '@repo/styles/jsx';
import type { TransactMode as TransactModeType } from '../data/reducers/wallet/transact-types.ts';
import { TransactMode } from '../data/reducers/wallet/transact-types.ts';
import { useAppSelector } from '../data/store/hooks.ts';
import {
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
  selectTokenPriceByAddress,
} from '../data/selectors/tokens.ts';
import { QuoteLoaded } from '../vault/components/Actions/Transact/TransactQuote/TransactQuote.tsx';
import { QuoteTitleRefresh } from '../vault/components/Actions/Transact/QuoteTitleRefresh/QuoteTitleRefresh.tsx';
import { isCowcentratedDepositQuote } from '../data/apis/transact/transact-types.ts';
import { Card } from '../vault/components/Card/Card.tsx';
import { CardContent } from '../vault/components/Card/CardContent.tsx';
import { CardHeaderTabs } from '../vault/components/Card/CardHeaderTabs.tsx';
import { TokensImageWithChain } from '../../components/TokenImage/TokenImage.tsx';
import ExpandMore from '../../images/icons/mui/ExpandMore.svg?react';
import type {
  CowcentratedZapDepositQuote,
  StandardVaultDepositQuote,
  StandardVaultWithdrawQuote,
  TokenAmount as QuoteTokenAmount,
  TransactQuote,
} from '../data/apis/transact/transact-types.ts';
import type { TokenEntity } from '../data/entities/token.ts';
import type { VaultEntity } from '../data/entities/vault.ts';
import type { BeefyState } from '../data/store/types.ts';

type Scenario = {
  id: string;
  title: string;
  description: string;
  quote: TransactQuote;
  effectiveQuote: TransactQuote;
  hasTransformation: boolean;
  isDeposit: boolean;
};

type PickedVaults = {
  singleAsset?: VaultEntity;
  lp?: VaultEntity;
  clm?: VaultEntity;
};

const QuotePreviewPage = memo(function QuotePreviewPage() {
  const scenarios = useAppSelector(buildAllScenarios);

  if (!scenarios) {
    return (
      <Page>
        <PageHeading>Quote UI preview</PageHeading>
        <Notice>
          Waiting for the app's normal data load to finish. Browse to a vault first, then come back
          here.
        </Notice>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeading>Quote UI preview</PageHeading>
      <Intro>
        Each block below is the real <code>QuoteLoaded</code> component rendered against a
        hand-crafted mock quote. Zap route and slippage blocks are omitted on purpose — they depend
        on live route data and aren't part of the alignment pass.
      </Intro>
      {scenarios.map(scenario => (
        <Section key={scenario.id}>
          <SectionHeader>
            <SectionTitle>{scenario.title}</SectionTitle>
            <SectionDescription>{scenario.description}</SectionDescription>
          </SectionHeader>
          <ScenarioCardWrapper>
            <ScenarioCard scenario={scenario} />
          </ScenarioCardWrapper>
        </Section>
      ))}
    </Page>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default QuotePreviewPage;

function buildAllScenarios(state: BeefyState): Scenario[] | null {
  const picked = pickRepresentativeVaults(state);
  const scenarios: Scenario[] = [];

  if (picked.singleAsset) {
    const built = buildSingleAssetScenarios(state, picked.singleAsset);
    if (built) scenarios.push(...built);
  }

  const pairVault = picked.clm ?? picked.lp;
  if (pairVault) {
    const built = buildPairScenarios(state, pairVault, !!picked.clm);
    if (built) scenarios.push(...built);
  }

  return scenarios.length > 0 ? scenarios : null;
}

function pickRepresentativeVaults(state: BeefyState): PickedVaults {
  const allIds = state.entities.vaults.allIds;
  const picked: PickedVaults = {};
  for (const id of allIds) {
    const v = state.entities.vaults.byId[id];
    if (!v) continue;
    if (v.status !== 'active') continue;
    if (!picked.singleAsset && v.type === 'standard' && v.assetIds.length === 1) {
      if (resolveSingleAssetToken(state, v)) picked.singleAsset = v;
    }
    if (!picked.lp && v.type === 'standard' && v.assetIds.length >= 2) {
      if (resolvePairTokens(state, v)) picked.lp = v;
    }
    if (!picked.clm && v.type === 'cowcentrated') {
      if (resolveClmTokens(state, v)) picked.clm = v;
    }
    if (picked.singleAsset && picked.clm && picked.lp) break;
  }
  return picked;
}

function resolveSingleAssetToken(state: BeefyState, vault: VaultEntity): TokenEntity | null {
  try {
    return selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  } catch {
    return null;
  }
}

function resolvePairTokens(
  state: BeefyState,
  vault: VaultEntity
): [TokenEntity, TokenEntity] | null {
  const [idA, idB] = vault.assetIds;
  const a = selectTokenByIdOrUndefined(state, vault.chainId, idA);
  const b = selectTokenByIdOrUndefined(state, vault.chainId, idB);
  if (!a || !b) return null;
  return [a, b];
}

function resolveClmTokens(
  state: BeefyState,
  vault: VaultEntity
): [TokenEntity, TokenEntity, TokenEntity] | null {
  if (vault.type !== 'cowcentrated') return null;
  const [addrA, addrB] = vault.depositTokenAddresses;
  try {
    const a = selectTokenByAddress(state, vault.chainId, addrA);
    const b = selectTokenByAddress(state, vault.chainId, addrB);
    const share = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return [a, b, share];
  } catch {
    return null;
  }
}

function buildSingleAssetScenarios(state: BeefyState, vault: VaultEntity): Scenario[] | null {
  const token = resolveSingleAssetToken(state, vault);
  if (!token) return null;
  const altToken = findAnyDifferentToken(state, vault.chainId, token);
  const scenarios: Scenario[] = [buildSimpleDeposit(vault, token)];
  if (altToken) {
    scenarios.push(buildZapDeposit(vault, token, altToken, false));
    scenarios.push(buildZapDeposit(vault, token, altToken, true));
  }
  scenarios.push(buildSimpleWithdraw(vault, token));
  if (altToken) {
    scenarios.push(buildZapWithdrawSingleOutput(vault, token, altToken, false));
    scenarios.push(buildZapWithdrawSingleOutput(vault, token, altToken, true));
  }
  return scenarios;
}

function buildPairScenarios(
  state: BeefyState,
  vault: VaultEntity,
  isClm: boolean
): Scenario[] | null {
  const pair = isClm ? resolveClmTokens(state, vault) : null;
  const lpPair = !isClm ? resolvePairTokens(state, vault) : null;
  if (isClm && !pair) return null;
  if (!isClm && !lpPair) return null;

  const scenarios: Scenario[] = [];
  if (isClm && pair) {
    const [a, b, share] = pair;
    const dust = findAnyDifferentToken(state, vault.chainId, a, b, share);
    scenarios.push(buildClmDeposit(vault, a, b, share, false));
    scenarios.push(buildClmDeposit(vault, a, b, share, true, dust));
    scenarios.push(buildPairBreakWithdraw(vault, share ?? a, a, b, false));
    scenarios.push(buildPairBreakWithdraw(vault, share ?? a, a, b, true, dust));
  } else if (!isClm && lpPair) {
    const [a, b] = lpPair;
    const share = resolveSingleAssetToken(state, vault);
    if (share) {
      const dust = findAnyDifferentToken(state, vault.chainId, a, b, share);
      scenarios.push(buildPairBreakWithdraw(vault, share, a, b, false));
      scenarios.push(buildPairBreakWithdraw(vault, share, a, b, true, dust));
    }
  }
  return scenarios;
}

function findAnyDifferentToken(
  state: BeefyState,
  chainId: TokenEntity['chainId'],
  ...exclude: (TokenEntity | null | undefined)[]
): TokenEntity | undefined {
  const excludeAddresses = new Set(exclude.filter(Boolean).map(t => t!.address.toLowerCase()));
  const chain = state.entities.tokens.byChainId[chainId];
  if (!chain) return undefined;
  for (const addr of Object.keys(chain.byAddress)) {
    if (excludeAddresses.has(addr.toLowerCase())) continue;
    const t = chain.byAddress[addr];
    if (t) return t;
  }
  return undefined;
}

// --- Scenario builders ------------------------------------------------------

function buildSimpleDeposit(vault: VaultEntity, token: TokenEntity): Scenario {
  const amount = new BigNumber('100');
  const quote: StandardVaultDepositQuote = {
    id: 'preview-simple-deposit',
    strategyId: 'vault',
    vaultType: 'standard',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token, amount, max: false }],
    outputs: [{ token, amount }],
    returned: [],
    option: mockVaultOption(vault, 'standard', TransactMode.Deposit),
  };
  return {
    id: 'D1',
    title: 'D1 · Simple deposit (no transformation)',
    description: `Single-asset vault where the user inputs the vault's own token. Example vault: "${vault.id}". Shows "You deposit" with a single default card; no "You receive" section.`,
    quote,
    effectiveQuote: quote,
    hasTransformation: false,
    isDeposit: true,
  };
}

function buildZapDeposit(
  vault: VaultEntity,
  depositToken: TokenEntity,
  inputToken: TokenEntity,
  withDust: boolean
): Scenario {
  const amount = new BigNumber('100');
  const shareAmount = new BigNumber('99.5');
  const returned: QuoteTokenAmount[] =
    withDust ? [{ token: inputToken, amount: new BigNumber('0.5') }] : [];
  const quote: StandardVaultDepositQuote = {
    id: withDust ? 'preview-zap-deposit-dust' : 'preview-zap-deposit',
    strategyId: 'vault',
    vaultType: 'standard',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token: inputToken, amount, max: false }],
    outputs: [{ token: depositToken, amount: shareAmount }],
    returned,
    option: mockVaultOption(vault, 'standard', TransactMode.Deposit),
  };
  return {
    id: withDust ? 'D2b' : 'D2',
    title:
      withDust ?
        'D2b · Zap deposit with dust'
      : 'D2 · Zap deposit (same-chain, different input token)',
    description:
      withDust ?
        'Same as D2 but with leftover dust. The refresh button anchors to the "You receive" title; card shows the output, dust toggle, and total.'
      : 'User picks an input token different from what the vault holds. Top title is hidden; "You receive" shows the output only (no dust/total).',
    quote,
    effectiveQuote: quote,
    hasTransformation: true,
    isDeposit: true,
  };
}

function buildSimpleWithdraw(vault: VaultEntity, token: TokenEntity): Scenario {
  const amount = new BigNumber('100');
  const quote: StandardVaultWithdrawQuote = {
    id: 'preview-simple-withdraw',
    strategyId: 'vault',
    vaultType: 'standard',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token, amount, max: false }],
    outputs: [{ token, amount }],
    returned: [],
    option: mockVaultOption(vault, 'standard', TransactMode.Withdraw),
  };
  return {
    id: 'W1',
    title: 'W1 · Simple withdraw (no transformation)',
    description:
      'User receives the vault\'s underlying token. Shows "You withdraw" with a single default card; no "You receive" section.',
    quote,
    effectiveQuote: quote,
    hasTransformation: false,
    isDeposit: false,
  };
}

function buildZapWithdrawSingleOutput(
  vault: VaultEntity,
  shareToken: TokenEntity,
  outToken: TokenEntity,
  withDust: boolean
): Scenario {
  const amount = new BigNumber('100');
  const returned: QuoteTokenAmount[] =
    withDust ? [{ token: shareToken, amount: new BigNumber('0.3') }] : [];
  const quote: StandardVaultWithdrawQuote = {
    id: withDust ? 'preview-zap-withdraw-dust' : 'preview-zap-withdraw',
    strategyId: 'vault',
    vaultType: 'standard',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token: shareToken, amount, max: false }],
    outputs: [{ token: outToken, amount: new BigNumber('98.2') }],
    returned,
    option: mockVaultOption(vault, 'standard', TransactMode.Withdraw),
  };
  return {
    id: withDust ? 'W2b' : 'W2',
    title:
      withDust ? 'W2b · Zap withdraw with dust' : 'W2 · Zap withdraw to a single different token',
    description:
      withDust ?
        'Same as W2 but with leftover dust. "You receive" card shows the output, dust toggle, and total.'
      : 'User withdraws and picks a different output token. Shows "You withdraw" with default card (the share), and "You receive" with just the output (no dust/total).',
    quote,
    effectiveQuote: quote,
    hasTransformation: true,
    isDeposit: false,
  };
}

function buildClmDeposit(
  vault: VaultEntity,
  tokenA: TokenEntity,
  tokenB: TokenEntity,
  shareToken: TokenEntity,
  withDust: boolean,
  dustToken?: TokenEntity
): Scenario {
  const inputAmount = new BigNumber('1000');
  const amountA = new BigNumber('0.0175');
  const amountB = new BigNumber('0.0105');
  const shareAmount = new BigNumber('0.0177');
  const returned: QuoteTokenAmount[] =
    withDust && dustToken ? [{ token: dustToken, amount: new BigNumber('0.38') }] : [];

  const option = mockVaultOption(vault, 'cowcentrated', TransactMode.Deposit, 'cowcentrated');
  const quote: CowcentratedZapDepositQuote = {
    id: withDust ? 'preview-clm-deposit-dust' : 'preview-clm-deposit',
    strategyId: 'cowcentrated',
    vaultType: 'cowcentrated',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token: tokenA, amount: inputAmount, max: false }],
    outputs: [{ token: shareToken, amount: shareAmount }],
    returned,
    fee: { value: 0 },
    steps: [],
    isCalm: true,
    used: [
      { token: tokenA, amount: amountA },
      { token: tokenB, amount: amountB },
    ],
    unused: [],
    position: [
      { token: tokenA, amount: amountA },
      { token: tokenB, amount: amountB },
    ],
    lpQuotes: [],
    option,
  } as unknown as CowcentratedZapDepositQuote;

  return {
    id: withDust ? 'D5' : 'D4',
    title:
      withDust ? 'D5 · CLM / CLM Pool deposit with dust' : 'D4 · CLM / CLM Pool deposit (no dust)',
    description:
      withDust ?
        'CLM deposit where a zap leaves leftover dust (e.g. slippage or cross-chain bridge residue). "You receive" unified card adds the dust collapsible and a Total row below the position grid.'
      : 'User deposits a single token into a CLM vault or CLM Pool. Shows "You deposit" with paired dark cards (the pair going in), and a unified "You receive" card (primary row + 2-column position breakdown).',
    quote,
    effectiveQuote: quote,
    hasTransformation: false,
    isDeposit: true,
  };
}

function buildPairBreakWithdraw(
  vault: VaultEntity,
  shareToken: TokenEntity,
  tokenA: TokenEntity,
  tokenB: TokenEntity,
  withDust: boolean,
  dustToken?: TokenEntity
): Scenario {
  const amount = new BigNumber('130.25');
  const amountA = new BigNumber('1583.93');
  const amountB = new BigNumber('12.06');
  const returned: QuoteTokenAmount[] =
    withDust && dustToken ? [{ token: dustToken, amount: new BigNumber('0.05') }] : [];
  const quote: StandardVaultWithdrawQuote = {
    id: withDust ? 'preview-pair-break-withdraw-dust' : 'preview-pair-break-withdraw',
    strategyId: 'vault',
    vaultType: 'standard',
    priceImpact: 0,
    allowances: [],
    inputs: [{ token: shareToken, amount, max: false }],
    outputs: [
      { token: tokenA, amount: amountA },
      { token: tokenB, amount: amountB },
    ],
    returned,
    option: mockVaultOption(vault, 'standard', TransactMode.Withdraw),
  };
  return {
    id: withDust ? 'W5b' : 'W5',
    title:
      withDust ?
        'W5b · Pair-break withdraw with dust'
      : 'W5 · Pair-break withdraw (LP vault / CLM vault / CLM Pool)',
    description:
      withDust ?
        'Same as W5 but with dust. Shows paired dark cards + dust toggle + total.'
      : 'User withdraws from an LP vault, CLM vault, or CLM Pool and receives the pair. Top shows primary-row card (the share with pair icons). "You receive" shows paired dark cards side-by-side.',
    quote,
    effectiveQuote: quote,
    hasTransformation: true,
    isDeposit: false,
  };
}

function mockVaultOption(
  vault: VaultEntity,
  vaultType: 'standard' | 'cowcentrated',
  mode: TransactModeType,
  strategyId: 'vault' | 'cowcentrated' = 'vault'
) {
  return {
    id: `preview-${vault.id}-${mode}-${strategyId}`,
    vaultId: vault.id,
    chainId: vault.chainId,
    selectionId: 'preview-selection',
    selectionOrder: 0,
    mode,
    strategyId,
    vaultType,
    inputs: [],
    wantedOutputs: [],
  } as never;
}

// --- Scenario card (tabs + input mock + real QuoteLoaded) -------------------

const ScenarioCard = memo(function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const noop = useCallback(() => undefined, []);
  const input = scenario.quote.inputs[0];
  const tokenPrice = useAppSelector(state =>
    input ?
      selectTokenPriceByAddress(state, input.token.chainId, input.token.address)
    : new BigNumber(0)
  );
  const usdValue = input ? input.amount.multipliedBy(tokenPrice) : new BigNumber(0);

  const selectedValue = (
    scenario.isDeposit ?
      TransactMode.Deposit
    : TransactMode.Withdraw).toString();
  const tabOptions = [
    { value: TransactMode.Deposit.toString(), label: 'Deposit' },
    { value: TransactMode.Withdraw.toString(), label: 'Withdraw' },
  ];

  const isCowcentratedDeposit = isCowcentratedDepositQuote(scenario.effectiveQuote);
  const showTitle = isCowcentratedDeposit || !scenario.isDeposit || !scenario.hasTransformation;
  const titleText = scenario.isDeposit ? 'You deposit' : 'You withdraw';

  return (
    <Card>
      <CardHeaderTabs selected={selectedValue} options={tabOptions} onChange={noop} />
      <CardContent>
        {input ?
          <MockInputBlock>
            <MockInputLabelRow>
              <MockInputLabel>Select amount</MockInputLabel>
              <MockAvailable>Available: {input.amount.toFixed(2)}</MockAvailable>
            </MockInputLabelRow>
            <MockInputCard>
              <MockInputAmountGroup>
                <MockInputAmount>{input.amount.toFixed(2)}</MockInputAmount>
                <MockInputUsd>${usdValue.toFixed(2)}</MockInputUsd>
              </MockInputAmountGroup>
              <MockTokenPill>
                <TokensImageWithChain
                  tokens={[input.token]}
                  chainId={input.token.chainId}
                  size={24}
                />
                <MockTokenSymbol>{input.token.symbol}</MockTokenSymbol>
                <MockChevron>
                  <ExpandMore />
                </MockChevron>
              </MockTokenPill>
            </MockInputCard>
          </MockInputBlock>
        : null}
        {showTitle ?
          <QuoteTitleRefresh title={titleText} enableRefresh={true} />
        : null}
        <QuoteLoaded
          quote={scenario.quote}
          effectiveQuote={scenario.effectiveQuote}
          hasTransformation={scenario.hasTransformation}
          isDeposit={scenario.isDeposit}
          showTitle={showTitle}
          showRouteBlocks={false}
        />
      </CardContent>
    </Card>
  );
});

// --- Styles -----------------------------------------------------------------

const Page = styled('div', {
  base: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    color: 'text.light',
  },
});

const PageHeading = styled('h1', {
  base: {
    textStyle: 'h1',
    color: 'text.lightest',
  },
});

const Intro = styled('p', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
  },
});

const Notice = styled('p', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
    padding: '24px',
    background: 'background.content.light',
    borderRadius: '8px',
  },
});

const Section = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});

const SectionHeader = styled('header', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
});

const SectionTitle = styled('h2', {
  base: {
    textStyle: 'h3',
    color: 'text.lightest',
  },
});

const SectionDescription = styled('p', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const ScenarioCardWrapper = styled('div', {
  base: {
    width: '400px',
    maxWidth: '100%',
  },
});

const MockInputBlock = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
  },
});

const MockInputLabelRow = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const MockInputLabel = styled('span', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
  },
});

const MockAvailable = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const MockInputCard = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'background.content.dark',
  },
});

const MockInputAmountGroup = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
  },
});

const MockInputAmount = styled('span', {
  base: {
    textStyle: 'h3',
    color: 'text.light',
  },
});

const MockInputUsd = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const MockTokenPill = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px 6px 6px',
    borderRadius: '18px 6px 6px 18px',
    background: 'background.content.light',
    flexShrink: 0,
  },
});

const MockTokenSymbol = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const MockChevron = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    color: 'text.light',
    '& svg': {
      width: '20px',
      height: '20px',
      fill: 'currentColor',
    },
  },
});
