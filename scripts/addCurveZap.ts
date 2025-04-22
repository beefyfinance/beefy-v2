import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { discoverCurveZap, saveCurveZap } from './zaps/curve.ts';

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
        header: 'npm run addCurveZap',
        content: 'Create zap config for a curve vault.',
      },
    ],
  });
}

export async function start() {
  const args = getRunArgs();
  if (args.help) {
    return;
  }

  const zap = await discoverCurveZap(args);
  if (!args.quiet) {
    console.log('Zap:', JSON.stringify(zap, null, 2));
  }
  await saveCurveZap(args.chain, args.vault, zap);
}

// npm run addCurveZap -- -- -c arbitrum -v curve-arb-asdcrv-v2.1
start().catch(e => {
  console.error(e);
  process.exit(1);
});
