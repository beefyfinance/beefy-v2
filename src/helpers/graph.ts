export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};

export const getXInterval = (dataLenght: number, xsDown: boolean) => {
  const interval = xsDown ? 8 : 10;
  const elementsPerResult = Math.ceil(dataLenght / interval);
  const numResults = Math.ceil(dataLenght / elementsPerResult);
  return Math.ceil(dataLenght / numResults);
};
