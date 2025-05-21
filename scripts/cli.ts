import { overrideEnv, runAll } from './common/process.ts';

/**
 * Replacement for cross-env usage in package.json scripts
 * Gives a way to pass environment variables to the commands in a cross-platform way
 * (i.e. that works on windows too)
 */

function productionEnv() {
  return overrideEnv({ NODE_ENV: 'production' });
}

function developmentEnv() {
  return overrideEnv({ NODE_ENV: 'development' });
}

async function build() {
  const skipValidate = process.argv.includes('--skip-validate');

  console.log('DO NOT disable validation on build, fix underlying issue');

  const env = productionEnv();
  const code = await runAll(
    [
      !skipValidate && { cmd: 'npm', args: ['run', 'validate'], env },
      { cmd: 'panda', args: ['codegen'], env },
      { cmd: 'tsc', args: ['--project', 'tsconfig.app.json'], env },
      { cmd: 'vite', args: ['build'], env },
    ],
    { timing: true }
  );

  // always return failure code if validation is skipped
  return skipValidate ? 1 : code;
}

async function dev() {
  const env = developmentEnv();
  return await runAll([
    { cmd: 'panda', args: ['codegen'], env },
    { cmd: 'vite', args: ['dev', ...process.argv.slice(3)], env },
  ]);
}

async function analyzeBundle() {
  const env = overrideEnv({ ANALYZE_BUNDLE: 'true' }, productionEnv());
  return await runAll([
    { cmd: 'panda', args: ['codegen'], env },
    { cmd: 'tsc', args: ['--project', 'tsconfig.app.json'], env },
    { cmd: 'vite', args: ['build'], env },
  ]);
}

const commands: Record<string, () => Promise<number>> = {
  build,
  dev,
  'analyze:bundle': analyzeBundle,
};

const commandName = process.argv[2]; // 0 = node, 1 = vite, 2 = command, 3+ = args
const command = commands[commandName];
if (!command) {
  console.error(`Unknown command: ${commandName}`);
  console.info(`Available commands: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

command()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
