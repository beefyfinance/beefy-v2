type TokenHoldingEligibility = {
  type: 'token-holding';
  tokens: string[];
};

type VaultWhitelistEligibility = {
  type: 'vault-whitelist';
};

type TokenByProviderEligibility = {
  type: 'token-by-provider';
  tokenProviderId: string;
  tokens: string[];
};

type EarnedTokenNameRegexEligibility = {
  type: 'earned-token-name-regex';
  regex: string;
};

type OnChainLpEligibility = {
  type: 'on-chain-lp';
  chain: string;
};

type TokenOnPlatformEligibility = {
  type: 'token-on-platform';
  platformId: string;
  tokens: string[];
};

type AnyPointProviderEligibility =
  | TokenHoldingEligibility
  | VaultWhitelistEligibility
  | TokenByProviderEligibility
  | EarnedTokenNameRegexEligibility
  | OnChainLpEligibility
  | TokenOnPlatformEligibility;

type ToJsonEligibilityArray<T> = T extends any ? (Omit<T, 'type'> & { type: string })[] : never;

export type PointProviderConfig = {
  id: string;
  docs: string;
  points: Array<{ id: string; name: string }>;
  eligibility: ToJsonEligibilityArray<AnyPointProviderEligibility>;
  accounting?: Array<{ id: string; role: string; url?: string; type?: string }>;
};
