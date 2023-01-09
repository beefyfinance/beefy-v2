export type GlpLikeConfig = {
  managerMethod: string; // 'glpManager' | 'mvlpManager'
};

export type UnlockTimeResult = {
  unlocksAt: number;
  cooldownDuration: number;
};
