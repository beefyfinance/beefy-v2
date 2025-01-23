import type { ChainEntity } from './chain';
import type { TokenEntity } from './token';
import type { VaultEntity } from './vault';
import type { BoostCampaignConfig, BoostPartnerConfig } from '../apis/config-types';

export interface BoostEntity {
  id: string;
  name: string;
  version: number; // 1 = legacy 1 token boost contract; 2 = multi reward pool contract
  tagIcon: string | undefined;
  tagText: string | undefined;

  // a boost always works on top of a vault, so it has a poolId that is an id for a vault
  vaultId: VaultEntity['id'];

  chainId: ChainEntity['id'];

  /**
   * "Earned" token is the token you get back for staking into a boost
   * you stake in boosts but they don't give you anything in return
   * so we created a fake "unique token identifier"
   * and for boosts we do: boostSymbol = ${boost.token}${boost.id}Boosts;
   */
  earnedTokenAddress: string;

  /**
   * This is the boost's contract address
   */
  contractAddress: string;

  /**
   * ASSETS are basically the assets that are in that boost
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assets: TokenEntity['id'][];

  partnerIds: BoostPartnerEntity['id'][];

  campaignId: BoostCampaignEntity['id'] | undefined;
}

export type BoostPartnerEntity = BoostPartnerConfig & {
  id: string;
};

export type BoostCampaignEntity = BoostCampaignConfig & {
  id: string;
};
