export const buildChartData = (historicalApy, apy, itemId) => {
  let baseData = [0, 0, 0, 0, 0, 0, 0, 0];

  if (historicalApy && historicalApy[itemId]) {
    baseData = historicalApy[itemId];
  }

  if (apy && apy[itemId]) {
    baseData.push(apy[itemId].totalApy);
  }

  return baseData.map(n => ({ apy: n }));
};