import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { discoverBalancerZap, saveBalancerZap } from './zaps/balancer.ts';

export type RunArgs = {
  help?: boolean;
  chain: string;
  vault: string;
  update?: boolean;
  quiet?: boolean;
};

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  chain: {
    type: String,
    alias: 'c',
    description: 'Which chain json file to process',
  },
  vault: {
    type: String,
    alias: 'v',
    description: 'Which vault id to process',
  },
  update: {
    type: Boolean,
    alias: 'u',
    description: 'Update the cache',
    optional: true,
  },
  quiet: {
    type: Boolean,
    alias: 'q',
    description: 'Only output warnings, errors and the zap json',
    optional: true,
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'npm run addBalancerZap',
        content: 'Create zap config for a balancer vault.',
      },
    ],
  });
}

export async function start() {
  const args = getRunArgs();
  if (args.help) {
    return;
  }

  const zap = await discoverBalancerZap(args);
  if (!args.quiet) {
    console.log('Zap:', JSON.stringify(zap, null, 2));
  }

  await saveBalancerZap(args.chain, args.vault, zap);
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
