import { getVaultsIntegrity } from './common/exclude.ts';

async function start() {
  const chain = process.argv[2];
  const integrity = await getVaultsIntegrity(chain);
  console.log(JSON.stringify(integrity, null, 2));
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
