export type GlpLikeConfig = {
  managerMethod: 'glpManager' | 'mvlpManager' | 'klpManager';
};

export type UnlockTimeResult = {
  unlocksAt: number;
  cooldownDuration: number;
};
