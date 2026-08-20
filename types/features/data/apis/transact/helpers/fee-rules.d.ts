import type { TokenEntity } from '../../../entities/token';
import type { VaultEntity } from '../../../entities/vault';
import type { ZapFeeEndpointMatcher, ZapFeeRule } from '../../config-types';
export declare const ZAP_FEE_BPS_MAX = 5;
export declare function clampZapFeeBps(bps: number): number;
export type ZapFeeMatch = {
    effectiveBps: number;
    baseBps: number;
    recipient: string;
    winner?: ZapFeeRule;
};
type VaultMatcher = NonNullable<ZapFeeEndpointMatcher['vault']>;
type TokenMatcher = NonNullable<ZapFeeEndpointMatcher['token']>;
export declare function isValidZapFeeRule(rule: ZapFeeRule): boolean;
export declare function featurableVaultSide(rule: ZapFeeRule): 'input' | 'output' | undefined;
export declare function isWithinZapFeeWindow(rule: ZapFeeRule, nowSeconds: number): boolean;
export declare function vaultMatchesMatcher(vault: VaultEntity, matcher: VaultMatcher): boolean;
export declare function tokenMatchesMatcher(token: TokenEntity, matcher: TokenMatcher): boolean;
export declare function pickLowestZapFee(rules: ZapFeeRule[], baseBps: number, recipient: string, matches: (rule: ZapFeeRule) => boolean): ZapFeeMatch;
export declare function matchFeaturedVaultCampaign(rules: ZapFeeRule[], feeConfig: {
    recipient: string;
    bps: number;
}, vault: VaultEntity, nowSeconds: number): ZapFeeMatch | undefined;
export {};
