import { config } from '../src/config/config';
import { readFile, writeFile } from 'fs/promises';
import { objectInsert } from './utils';

const providerWithFarmRegex = /(.+) \(([^)]+)\)/;

const mapStrategies = {
  StratLP: 'lp',
  StableLP: 'lp',
  StratMultiLP: 'multi-lp',
  Lending: 'lending',
  SingleStake: 'single',
  StratSingle: 'single',
  Maxi: 'maxi',
};

const correctPlatforms = {
  '0xdao': '0xDAO',
  '1inch': '1Inch',
  '2omb': '2omb',
  aave: 'Aave',
  alpaca: 'Alpaca',
  annex: 'Annex',
  apeswap: 'ApeSwap',
  autofarm: 'Autofarm',
  babyswap: 'BabySwap',
  bakery: 'Bakery',
  bankerjoe: 'Banker Joe',
  based: 'Based',
  bdollar: 'bDollar',
  beamswap: 'Beamswap',
  beefy: 'Beefy',
  beethovenx: 'Beethoven X',
  belt: 'Belt',
  betu: 'BETU',
  billionhappiness: 'BillionHappiness',
  bingo: 'Bingo',
  bishares: 'BiShares',
  biswap: 'BiSwap',
  biti: 'Biti',
  blizz: 'Blizz',
  blizzard: 'Blizzard',
  blockmine: 'BlockMine',
  bolt: 'Bolt',
  bomb: 'Bomb',
  bombmoney: 'Bomb.Money',
  boneswap: 'BoneSwap',
  cafeswap: 'CafeSwap',
  charge: 'Charge',
  cometh: 'Cometh',
  complus: 'Complus',
  cronaswap: 'CronaSwap',
  crow: 'Crow',
  curve: 'Curve',
  czodiac: 'CZodiac',
  darkcrypto: 'DarkCrypto',
  dfyn: 'DFyn',
  dibs: 'Dibs',
  dinoswap: 'DinoSwap',
  dopple: 'Dopple',
  dotdot: 'DotDot',
  dragonlair: 'DragonLair',
  dumpling: 'Dumpling',
  elkfinance: 'ElkFinance',
  ellipsis: 'Ellipsis',
  emp: 'EMP',
  empmoney: 'EMP.Money',
  ester: 'Ester',
  farmhero: 'FarmHero',
  firebird: 'Firebird',
  fortube: 'ForTube',
  froyo: 'Froyo',
  fruit: 'Fruit',
  fryworld: 'FryWorld',
  fuel: 'Fuel',
  fuse: 'Fuse',
  garuda: 'Garuda',
  geist: 'Geist',
  gondola: 'Gondola',
  grand: 'Grand',
  grape: 'Grape',
  hector: 'Hector',
  hfi: 'HFI',
  honeyfarm: 'HoneyFarm',
  huckleberry: 'Huckleberry',
  icarus: 'Icarus',
  iron: 'Iron',
  ironfinance: 'IronFinance',
  ironswap: 'IronSwap',
  jarvis: 'Jarvis',
  jetswap: 'JetSwap',
  julswap: 'JulSwap',
  kebab: 'Kebab',
  kingdefi: 'KingDefi',
  kyber: 'Kyber',
  l2: 'L2',
  lavaswap: 'Lavaswap',
  lendhub: 'Lendhub',
  liquidus: 'Liquidus',
  longdrink: 'Longdrink',
  lydia: 'Lydia',
  mai: 'Mai',
  marshmallow: 'Marshmallow',
  mdex: 'Mdex',
  memefarm: 'MemeFarm',
  merlin: 'Merlin',
  mim: 'MIM',
  mmf: 'MMF',
  monster: 'Monster',
  narwhal: 'Narwhal',
  netswap: 'Netswap',
  nfty: 'NFTY',
  nyanswop: 'Nyanswop',
  oliveswap: 'OliveSwap',
  omnifarm: 'Omnifarm',
  omnitrade: 'Omnitrade',
  openocean: 'OpenOcean',
  other: 'Other',
  pacoca: 'Pacoca',
  pancake: 'PancakeSwap',
  pancakebunny: 'Pancakebunny',
  pancakeswap: 'PancakeSwap',
  pangolin: 'Pangolin',
  pantherswap: 'PantherSwap',
  pearzap: 'PearZap',
  pera: 'Pera',
  polyalpha: 'PolyAlpha',
  polycat: 'Polycat',
  polygonfarm: 'PolygonFarm',
  polypup: 'Polypup',
  polysage: 'PolySage',
  polywantsacracker: 'PolyWantsACracker',
  polywhale: 'Polywhale',
  polywise: 'Polywise',
  polyyeld: 'Polyyeld',
  polyzap: 'Polyzap',
  popsicle: 'Popsicle',
  pumpy: 'Pumpy',
  quant: 'QUANT',
  quickswap: 'QuickSwap',
  rabbitfinance: 'RabbitFinance',
  ramenswap: 'RamenSwap',
  ripae: 'Ripae',
  rose: 'Rose',
  saltswap: 'SaltSwap',
  sandman: 'Sandman',
  satis: 'Satis',
  scream: 'Scream',
  singular: 'Singular',
  sjoe: 'sJoe',
  slimefinance: 'SlimeFinance',
  snowball: 'Snowball',
  solace: 'Solace',
  solarbeam: 'SolarBeam',
  solarflare: 'Solarflare',
  soup: 'Soup',
  spartacadabra: 'Spartacadabra',
  spiritswap: 'SpiritSwap',
  sponge: 'Sponge',
  spookyswap: 'SpookySwap',
  squirrel: 'Squirrel',
  stakesteak: 'StakeSteak',
  stargate: 'Stargate',
  steakhouse: 'SteakHouse',
  stellaswap: 'Stellaswap',
  summitdefi: 'SummitDefi',
  sushi: 'Sushi',
  sushiswap: 'SushiSwap',
  swamp: 'Swamp',
  swirl: 'Swirl',
  synapse: 'Synapse',
  telxchange: 'Telxchange',
  ten: 'Ten',
  tethys: 'Tethys',
  thunderswap: 'ThunderSwap',
  tomb: 'Tomb',
  tombswap: 'TombSwap',
  tosdis: 'Tos  Dis',
  traderjoe: 'Trader Joe',
  traphouse: 'Traphouse',
  trisolaris: 'Trisolaris',
  typhoon: 'Typhoon',
  valas: 'Valas',
  valleyswap: 'ValleySwap',
  venus: 'Venus',
  viralata: 'Viralata',
  voltage: 'Voltage',
  vvs: 'VVS',
  wault: 'WaultFinance',
  waultfinance: 'WaultFinance',
  wigoswap: 'WigoSwap',
  wsg: 'WSG',
  yel: 'YEL',
  yieldbay: 'YieldBay',
  yuzuswap: 'YuzuSwap',
  zcore: 'ZCore',
};

const addLiquidityUrlToProvider = {
  '1inch.exchange': '1Inch',
  'alpacafinance.org': 'Alpaca',
  'annex.finance': 'Annex',
  'apeswap.finance': 'ApeSwap',
  'babyswap.finance': 'BabySwap',
  'bakeryswap.org': 'Bakery',
  'beamswap.io': 'Beamswap',
  'beethovenx.io': 'Beethoven X',
  'beets.fi': 'Beethoven X',
  'belt.fi': 'Belt',
  'biswap.org': 'BiSwap',
  'cafeswap.finance': 'CafeSwap',
  'cometh.io': 'Cometh',
  'complus.exchange': 'Complus',
  'cronaswap.org': 'CronaSwap',
  'curve.fi': 'Curve',
  'dfyn.network': 'DFyn',
  'dopple.finance': 'Dopple',
  'elk.finance': 'ElkFinance',
  'ellipsis.finance': 'Ellipsis',
  'frozenyogurt.finance': 'Froyo',
  'fuse.fi': 'Voltage',
  'gondola.finance': 'Gondola',
  'huckleberry.finance': 'Huckleberry',
  'iron.finance': 'IronSwap',
  'jetswap.finance': 'JetSwap',
  'julswap.com': 'JulSwap',
  'kebabfinance.com': 'Kebab',
  'lavaswap.com': 'Lavaswap',
  'lydia.finance': 'Lydia',
  'marshmallowdefi.com': 'Marshmallow',
  'mdex.com': 'Mdex',
  'mdex.me': 'Mdex',
  'narwhalswap.org': 'Narwhal',
  'netswap.io': 'Netswap',
  'olive.cash': 'OliveSwap',
  'openocean.finance': 'OpenOcean',
  'pancakeswap.finance': 'PancakeSwap',
  'pangolin.exchange': 'Pangolin',
  'pantherswap.com': 'PantherSwap',
  'polyzap.app': 'Polyzap',
  'quickswap.exchange': 'QuickSwap',
  'ramenswap.finance': 'RamenSwap',
  'rose.fi': 'Rose',
  'saltswap.finance': 'SaltSwap',
  'slime.finance': 'SlimeFinance',
  'snowball.network': 'Snowball',
  'solarbeam.io': 'SolarBeam',
  'solarflare.io': 'Solarflare',
  'spiritswap.finance': 'SpiritSwap',
  'sponge.finance': 'Sponge',
  'spooky.fi': 'SpookySwap',
  'stakesteak.app': 'StakeSteak',
  'stellaswap.com': 'Stellaswap',
  'sushi.com': 'SushiSwap',
  'synapseprotocol.com': 'Synapse',
  'tethys.finance': 'Tethys',
  'thunderswap.finance': 'ThunderSwap',
  'tomb.com': 'TombSwap',
  'traderjoexyz.com': 'Trader Joe',
  'trisolaris.io': 'Trisolaris',
  'valleyswap.com': 'ValleySwap',
  'viralata.finance': 'Viralata',
  'voltage.finance': 'Voltage',
  'vvs.finance': 'VVS',
  'wault.finance': 'WaultFinance',
  'wigoswap.io': 'WigoSwap',
  'yieldbay.finance': 'YieldBay',
  'yuzu-swap.com': 'YuzuSwap',
};

const vaultIdToProvider = {
  hfi: correctPlatforms['mdex'],
  cakev2: correctPlatforms['pancakeswap'],
  wex: correctPlatforms['waultfinance'],
  cake: correctPlatforms['pancakeswap'],
  blizzard: correctPlatforms['pancakeswap'],
  swamp: correctPlatforms['swamp'],
  naut: correctPlatforms['apeswap'],
  alpaca: correctPlatforms['alpaca'],
  jul: correctPlatforms['julswap'],
  sponge: correctPlatforms['sponge'],
  nyacash: correctPlatforms['pancakeswap'],
  jetfuel: correctPlatforms['pancakeswap'],
  street: 'ThugSwap',
  space: correctPlatforms['pancakeswap'],
  cafe: correctPlatforms['cafeswap'],
};

const manualFixes = {
  'joe-joe': {
    platformName: correctPlatforms['traderjoe'],
  },
  'street-drugs-bnb-v1': {
    platformName: correctPlatforms['traphouse'],
  },
  'cake-cake-eol': {
    platformName: correctPlatforms['pancakeswap'],
  },
  'fry-burger-v2': {
    platformName: correctPlatforms['fryworld'],
  },
  'cake-syrup-twt': {
    platformName: correctPlatforms['pancakeswap'],
  },
  'fry-burger-v1': {
    platformName: correctPlatforms['fryworld'],
  },
  'quick-quick': {
    platformName: correctPlatforms['quickswap'],
  },
};

function getProviderFromAddLiquidityUrl(url: string) {
  const domain = getDomainFromUrl(url);
  if (domain in addLiquidityUrlToProvider) {
    return addLiquidityUrlToProvider[domain];
  }

  return null;
}

function getProviderFromVaultId(vaultId: string) {
  const parts = vaultId.split('-');
  if (parts.length) {
    const prefix = parts[0];

    if (prefix in vaultIdToProvider) {
      return vaultIdToProvider[prefix];
    }
  }

  return null;
}

function getDomainFromUrl(url: string) {
  const uri = new URL(url);
  const parts = uri.hostname.split('.');
  return parts.slice(parts.length - 2).join('.');
}

function platformToId(platform: string) {
  return platform.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

function fixPlatform(platform: string) {
  let fixedPlatform = platform;

  const key = platformToId(platform);
  if (key in correctPlatforms) {
    fixedPlatform = correctPlatforms[key];
  }

  return fixedPlatform.trim().replaceAll(/\s+/g, ' ');
}

async function migrateNetwork(network: string) {
  const vaults = JSON.parse(await readFile(`./src/config/vault/${network}.json`, 'utf8'));
  const platforms = [];

  const newVaults = vaults.map(vault => {
    const originalDisplayPlatformName = vault.tokenDescription;
    const originalFilterPlatformName = fixPlatform(vault.platform || 'Other');

    let platformName = null;
    let providerName = null;

    // "Provider (Farm)" or "Farm"
    const match = providerWithFarmRegex.exec(originalDisplayPlatformName);
    if (match) {
      platformName = fixPlatform(match[2]);
      providerName = fixPlatform(match[1]);
    } else {
      platformName = fixPlatform(originalDisplayPlatformName);
    }

    // LP Provider is missing
    if (vault.oracle === 'lps' && !providerName) {
      // Add missing provider using addLiquidityUrl
      if (vault.addLiquidityUrl) {
        const maybeProvider = getProviderFromAddLiquidityUrl(vault.addLiquidityUrl);
        if (maybeProvider) {
          providerName = fixPlatform(maybeProvider);
        } else {
          console.error(vault.id, 'no provider for', vault.addLiquidityUrl);
        }
      }

      // Add missing provider using vault id
      if (!providerName) {
        const maybeProvider = getProviderFromVaultId(vault.id);
        if (maybeProvider) {
          providerName = fixPlatform(maybeProvider);
        } else {
          console.error(vault.id, 'no provider or addLiquidityUrl');
        }
      }
    }

    // Manually fix some vaults
    if (vault.id in manualFixes) {
      if ('platformName' in manualFixes[vault.id]) {
        platformName = manualFixes[vault.id].platformName;
      }
      if ('providerName' in manualFixes[vault.id]) {
        providerName = manualFixes[vault.id].providerName;
      }
    }

    // Note manual fix needed for some platforms with unusual tokenDescriptions e.g. Please use Smart Cake PancakeSwap
    if (vault.oracle === 'tokens' && originalFilterPlatformName !== 'Other') {
      if (platformName !== originalFilterPlatformName) {
        console.log('[MANUAL]', vault.id, ':', platformName, '->', originalFilterPlatformName);
      }
    }

    if (!platformName) {
      console.error(vault.id, 'no platform');
    }

    // Build list of platforms
    if (platformName) {
      platforms.push({
        id: platformToId(platformName),
        name: platformName,
        filter: originalFilterPlatformName !== 'Other',
      });
    }
    if (providerName) {
      platforms.push({ id: platformToId(providerName), name: providerName });
    }

    // Strategy Type
    let strategyId = null;
    if (vault.stratType) {
      if (vault.stratType in mapStrategies) {
        strategyId = mapStrategies[vault.stratType];
        if (strategyId === 'lp' || strategyId === 'multi-lp') {
          strategyId = vault.assets.length > 2 ? 'multi-lp' : 'lp';
        }
      } else {
        console.error(vault.id, 'invalid stratType', vault.stratType);
      }
    } else {
      console.error(vault.id, 'no stratType');
    }

    // Update vault
    delete vault.tokenDescription;
    delete vault.tokenDescriptionUrl;
    delete vault.pricePerFullShare;
    delete vault.tvl;
    delete vault.oraclePrice;
    delete vault.platform;
    delete vault.stratType;
    delete vault.logo;

    vault = objectInsert('platformId', platformToId(platformName), vault, 'status', 'after');

    if (providerName) {
      vault = objectInsert(
        'tokenProviderId',
        platformToId(providerName),
        vault,
        'earnedToken',
        'before'
      );
    }

    if (strategyId) {
      vault = objectInsert('strategyTypeId', strategyId, vault, 'assets', 'after');
    }

    return vault;
  });

  await writeFile(`./src/config/vault/${network}.json`, JSON.stringify(newVaults, undefined, 2));
  return platforms;
}

async function migrate() {
  const platformsPerNetwork = await Promise.all(
    Object.keys(config).map(network => migrateNetwork(network))
  );

  const counted: Record<
    string,
    { id: string; name: string; includeFilter: number; excludeFilter: number }
  > = {};
  for (const platforms of platformsPerNetwork) {
    for (const platform of platforms) {
      if (!(platform.id in counted)) {
        counted[platform.id] = {
          id: platform.id,
          name: platform.name,
          includeFilter: 0,
          excludeFilter: 0,
        };
      }

      if ('filter' in platform) {
        ++counted[platform.id][platform.filter ? 'includeFilter' : 'excludeFilter'];
      }
    }
  }

  const platforms = Object.values(counted).map(platform => ({
    id: platform.id,
    name: platform.name,
    filter: platform.includeFilter > platform.excludeFilter,
  }));

  console.dir(platforms);

  await writeFile(`./src/config/platforms.json`, JSON.stringify(platforms, undefined, 2));
}

migrate().catch(err => {
  console.error(err);
  process.exit(-1);
});
