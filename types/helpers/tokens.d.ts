import { type TokenEntity } from '../features/data/entities/token';
import type { VaultEntity } from '../features/data/entities/vault';
export declare function uniqueTokens<T extends TokenEntity>(tokens: T[]): T[];
export declare function checkAddressOrder(addresses: string[]): void;
export declare function tokenInList<T extends TokenEntity>(token: T, list: T[]): boolean;
export declare function symbolToLabelAndTag(symbol: string): {
    label: string;
    tag: string | undefined;
};
export declare function extractTagFromLpSymbol(tokens: TokenEntity[], vault: VaultEntity): {
    tokens: TokenEntity[];
    tag: string | undefined;
};
