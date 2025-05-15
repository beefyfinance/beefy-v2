import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { spawn } from 'cross-spawn';
import { Timers } from './timers.ts';

/**
 * Forward kill signals from the parent process to the child process.
 */
function forwardKillSignals(child: ChildProcess) {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'];
  const forwarders = signals.map(signal => {
    const forwarder = () => {
      child.kill(signal);
    };

    process.on(signal, forwarder);

    return { signal, forwarder };
  });

  return () => {
    forwarders.forEach(({ signal, forwarder }) => {
      process.off(signal, forwarder);
    });
  };
}

/**
 * Current process environment variables with optional overrides
 */
export function overrideEnv(overrides?: NodeJS.ProcessEnv, base: NodeJS.ProcessEnv = process.env) {
  return { ...base, ...overrides };
}

/**
 * Current process environment variables with optional default variables to be set if missing
 */
export function defaultEnv(defaults?: NodeJS.ProcessEnv, base: NodeJS.ProcessEnv = process.env) {
  return { ...defaults, ...base };
}

type RunArgs = {
  cmd: string;
  args?: readonly string[];
  env?: NodeJS.ProcessEnv;
};

/**
 * Run a command with optional arguments and environment variables
 * @returns The exit code of the command
 */
async function run({ cmd, args, env }: RunArgs) {
  return new Promise<number>(resolve => {
    try {
      const options: SpawnOptions = { stdio: 'inherit', env };
      const child = args ? spawn(cmd, args, options) : spawn(cmd, options);
      const unforward = forwardKillSignals(child);
      child.on('error', console.error);
      child.on('disconnect', () => {
        resolve(1);
      });
      child.on('exit', (code, signal) => {
        unforward();
        resolve(
          code === null ?
            signal === 'SIGINT' ?
              0
            : 1
          : code
        );
      });
    } catch (error) {
      console.error(error);
      resolve(1);
    }
  });
}

type RunAllOptions = {
  timing?: boolean;
};

/**
 * Run all commands in sequence, stopping on the first non-zero exit code
 * @returns The first non-zero exit code, or 0 if all commands succeeded
 */
export async function runAll(
  commands: (RunArgs | undefined | false | null)[],
  { timing = false }: RunAllOptions = {}
) {
  const filtered = commands.filter((c): c is RunArgs => typeof c === 'object' && c !== null);
  if (filtered.length === 0) {
    console.error('No commands to run');
    return 1;
  }

  const timers = new Timers(timing);
  const abortController = new AbortController();
  process.on('SIGINT', () => abortController.abort());

  let returnCode = 0;
  for (const command of filtered) {
    const commandName = `$ ${command.cmd} ${command.args?.join(' ') || ''}`.trim();
    console.log(commandName);

    timers.start(commandName);
    const code = await run(command);
    timers.stop(commandName);

    if (abortController.signal.aborted) {
      console.error('Aborted');
      returnCode = 1;
      break;
    }

    if (code !== 0) {
      returnCode = code;
      break;
    }
  }

  timers.summary();
  return returnCode;
}
