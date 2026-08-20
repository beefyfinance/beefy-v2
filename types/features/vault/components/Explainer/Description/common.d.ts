import { type ReactElement } from 'react';
import { type TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../../data/entities/chain';
import type { PlatformEntity } from '../../../../data/entities/platform';
import type { TokenEntity } from '../../../../data/entities/token';
import { type VaultCowcentratedLike, type VaultEntity, type VaultErc4626, type VaultGov, type VaultStandard } from '../../../../data/entities/vault';
export type CommonHelper<TVault extends VaultEntity = VaultEntity> = {
    vault: TVault;
    chain: ChainEntity;
    platform: PlatformEntity;
    assetSymbols: string[];
    depositToken: TokenEntity;
    depositTokenProvider: PlatformEntity | undefined;
    i18n: {
        t: TFunction;
        i18nKey: string[];
        values: Record<string, string>;
        ns: string;
        components?: Record<string, ReactElement>;
    };
};
export declare function useCommonHelper(vaultId: VaultEntity['id']): CommonHelper;
export declare function isCowcentratedLikeCommonHelper(helper: CommonHelper): helper is CommonHelper<VaultCowcentratedLike>;
export declare function isGovCommonHelper(helper: CommonHelper): helper is CommonHelper<VaultGov>;
export declare function isStandardCommonHelper(helper: CommonHelper): helper is CommonHelper<VaultStandard>;
export declare function isErc4626Helper(helper: CommonHelper): helper is CommonHelper<VaultErc4626>;
