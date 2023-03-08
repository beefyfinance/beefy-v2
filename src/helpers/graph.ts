export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};

//Interval
// 1h_1d = results 24 in hours = 2 hours
// 1h_1w = resuls 168 in hours =  24 hours
// 1d_1M = results 30 days = 2 days
// 1d_all = result Max 180 days = 14 days
export const X_AXIS_INTERVAL = [2, 24, 2, 14];
