import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { addressBookToAppId } from './common/config.ts';
import { discoverBeraSwapZap, saveBeraSwapZap, supportedChainIds } from './zaps/beraswap.ts';

export type RunArgs = {
  help?: boolean;
  chain?: string;
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
    defaultValue: 'berachain',
    optional: true,
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
        header: 'npm run addBeraSwapZap',
        content: 'Create zap config for a BeraSwap vault.',
      },
    ],
  });
}

export async function start() {
  const args = getRunArgs();
  if (args.help) {
    return;
  }

  const chain = addressBookToAppId(args.chain || 'berachain');
  if (!supportedChainIds.has(chain)) {
    throw new Error(`Unsupported chain ${chain}`);
  }

  const zap = await discoverBeraSwapZap({ ...args, chain });
  if (!args.quiet) {
    console.log('Zap:', JSON.stringify(zap, null, 2));
  }

  await saveBeraSwapZap(chain, args.vault, zap);
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
