export type PromptChoice<TValue extends string = string> = {
  name: string;
  value: TValue;
  disabled?: boolean;
  description?: string;
  short?: string;
};
