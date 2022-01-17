import { Partner } from './partner';
import { Token } from './token';
import { Vault } from './vault';

// TODO: WIP
interface Boost {
  id: string;
  name: string;
  logo: string | null;

  // the boost's address
  contractAddress: string;

  // a boost always works on top of a vault, so it has a poolId that is an id for a vault
  vaultId: Vault['id'];

  /**
   * "Earned" token is the token you get back for staking into a boost
   * you stake in boosts but they don't give you anything in return
   * so we created a fake "unique token identifier"
   * and for boosts we do: boostSymbol = ${boost.token}${boost.id}Boost;
   */
  // todo: is this useful?
  earnedToken: Token['id'];

  /**
   * ASSETS are basically the assets that are in that boost
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assets: Token['id'][];

  partners: Partner['id'][];
}
