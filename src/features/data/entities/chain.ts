/**
 * The chain entity as you know it
 * bsc, harmony, avax, etc
 * Sometimes named "network"
 */
export interface ChainEntity {
  id: string;
  name: string;

  // todo: is this really necessary
  rpcEndpoint: string; // maybe not
  urlTemplates: {
    // maybe not
    contract: string; // "https://bscscan.com/token/{address}"
    address: string; // "https://bscscan.com/address/{address}"
  };
}
