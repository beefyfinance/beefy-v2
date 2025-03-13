import { CATEGORIES, MAX_SCORE, SCORED_RISKS, type ScoredRisk } from '../config/risk.ts';

const calcRisk = (arr: string[]) => {
  const categories: Record<string, ScoredRisk[]> = {};

  for (const c in CATEGORIES) {
    categories[c] = [];
  }

  // reverse lookup
  arr.forEach(r => {
    const risk = SCORED_RISKS[r];
    if (!risk) {
      console.warn('unknown risk', r);
      return;
    }

    if (!('category' in risk)) {
      // token/platform risk with no score
      return;
    }

    const cat = risk.category;
    if (!(cat in CATEGORIES)) {
      console.warn('unknown category', cat);
      return;
    }

    categories[cat].push(risk);
  });

  // reduce & clamp
  let risk = 0;
  for (const c in CATEGORIES) {
    const w = CATEGORIES[c];
    risk +=
      w *
      Math.min(
        1,
        categories[c].reduce((acc: number, risk: ScoredRisk) => acc + risk.score, 0)
      );
  }

  return risk;
};

export const safetyScoreNum = (arr: string[]) => {
  if (arr.length === 0) return undefined;

  return MAX_SCORE * (1 - calcRisk(arr));
};
