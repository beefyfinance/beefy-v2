// https://redux.js.org/usage/structuring-reducers/normalizing-state-shape#designing-a-normalized-state
// we could use the npm package normalizr or the redux-toolkit createEntityAdapter
// but I think it's too early/complex for now
export type NormalizedEntity<T extends { id: string }> = {
  // Effectively an index of all entities
  byId: {
    [id: string]: T;
  };
  // normalization best practice, keeps the same array reference
  // for iteration, can be extended for vaults with different
  // arrays like "allBscIds", "allHarmonyIds", "allStableIds", etc etc
  allIds: string[];
};
