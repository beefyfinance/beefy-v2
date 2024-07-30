import { Command } from './types';

export async function loadCommand<T>(command: string): Promise<Command<T>> {
  const module = await import(`./commands/${command.replace(':', '/')}`);
  return module.default;
}
