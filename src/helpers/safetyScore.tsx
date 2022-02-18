import { MAX_SCORE, RISKS, CATEGORIES } from '../config/risk';

const calcRisk = (arr: string[]) => {
  const categories = {};
  for (const c in CATEGORIES) {
    categories[c] = [];
  }

  // reverse lookup
  arr.forEach((r, idx) => {
    if (!(r in RISKS)) {
      //console.warn('unknown risk', r);
      return;
    }

    const cat = RISKS[r].category;
    if (!(cat in CATEGORIES)) {
      console.warn('unknown category', cat);
      return;
    }

    categories[cat].push(r);
  });

  // reduce & clamp
  let risk = 0;
  for (const c in CATEGORIES) {
    const w = CATEGORIES[c];
    risk +=
      w *
      Math.min(
        1,
        categories[c].reduce((acc: number, r: number) => acc + RISKS[r].score, 0)
      );
  }

  return risk;
};

export const safetyScoreNum = (arr: string[]) => {
  if (arr.length === 0) return null;

  return MAX_SCORE * (1 - calcRisk(arr));
};
