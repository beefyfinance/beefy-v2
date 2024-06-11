export type AllCowcentratedVaultRangesResponse = {
  [chainId: string]: {
    [vaultId: string]: {
      currentPrice: string;
      priceRangeMin: string;
      priceRangeMax: string;
    };
  };
};
