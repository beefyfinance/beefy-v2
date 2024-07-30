import { ArgumentConfig } from 'ts-command-line-args';

export type CommandArgs<T> = T & {
  help?: boolean;
};

export type Command<T> = {
  args: ArgumentConfig<T>;
  description: string;
  run: (args: T) => Promise<void>;
};
