import { type Plugin } from 'vite';
import { mnemonicToAccount } from 'viem/accounts';
import type { PluginContext } from 'rollup';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { Address } from 'viem';

type UnsignedAccountAssociation = {
  /** Farcaster ID of the account */
  id: string;
  /** Custody phrase of the account, used to sign the association */
  mnemonic: string;
  /** Domain to associate with the Farcaster ID */
  domain: string;
};

type SignedAccountAssociation = {
  header: string;
  payload: string;
  signature: string;
};

export type MiniAppPluginOptions = {
  domain: string;
  /** max length 32 characters, no special characters  */
  name: string;
  /** max length 30 characters, no special characters  */
  subtitle: string;
  /** max length 170 characters, no special characters  */
  description: string;
  /** primary category */
  category: MiniAppManifest['primaryCategory'];
  /** max 5, max 20 characters each, lower case, no spaces, no special characters */
  tags: string[];
  /** defaults to subtitle */
  tagline?: string;
  /** defaults to name */
  ogTitle?: string;
  /** defaults to description */
  ogDescription?: string;
  /** splash background color, must be a valid hex color */
  splashBackgroundColor: string;
  /** 200 x 200px PNG, no alpha */
  splashImagePath: string;
  /** 1024 x 1024px PNG, no alpha */
  iconPath: string;
  /** 1284 x 2778px PNG, no alpha, max 3 */
  screenshotPaths: string[];
  /** 1200 x 630px PNG, no alpha */
  heroImagePath: string;
  /** 1200 x 630px PNG, no alpha, defaults to hero image */
  ogImagePath?: string;
  /** 1200 x 800px PNG, no alpha */
  embedImagePath: string;
  /** true to exclude from search results */
  noindex?: boolean;
  /** Capabilities required by the mini app */
  capabilities?: MiniAppManifest['requiredCapabilities'];
  /** Farcaster account association */
  account: UnsignedAccountAssociation | SignedAccountAssociation;
  /** Base builder rewards */
  baseBuilderAddresses: Address[];
};

/** @see https://github.com/farcasterxyz/miniapps/blob/main/packages/miniapp-core/src/types.ts#L48 */
const miniAppHostCapabilityList = [
  'wallet.getEthereumProvider',
  'wallet.getSolanaProvider',
  'actions.ready',
  'actions.openUrl',
  'actions.close',
  'actions.setPrimaryButton',
  'actions.addMiniApp',
  'actions.signIn',
  'actions.viewCast',
  'actions.viewProfile',
  'actions.composeCast',
  'actions.viewToken',
  'actions.sendToken',
  'actions.swapToken',
  'actions.openMiniApp',
  'actions.requestCameraAndMicrophoneAccess',
  'haptics.impactOccurred',
  'haptics.notificationOccurred',
  'haptics.selectionChanged',
  'back',
] as const;

type MiniAppHostCapability = (typeof miniAppHostCapabilityList)[number];

const miniAppCategories = [
  'games',
  'social',
  'finance',
  'utility',
  'productivity',
  'health-fitness',
  'news-media',
  'music',
  'shopping',
  'education',
  'developer-tools',
  'entertainment',
  'art-creativity',
] as const;

type MiniAppCategory = (typeof miniAppCategories)[number];

type MiniAppManifest = {
  version: '1';
  name: string;
  canonicalDomain: string;
  homeUrl: string;
  iconUrl: string;
  splashImageUrl: string;
  splashBackgroundColor: string;
  subtitle: string;
  description: string;
  screenshotUrls: string[];
  primaryCategory: MiniAppCategory;
  tags: string[];
  heroImageUrl: string;
  tagline: string;
  requiredCapabilities?: MiniAppHostCapability[];
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  noindex?: boolean;
};

type MiniAppEmbed = {
  version: '1';
  imageUrl: string;
  button: {
    title: string;
    action: {
      name: string;
      type: 'launch_miniapp';
      url: string;
    };
  };
};

async function signAccountAssociation({
  id,
  mnemonic,
  domain,
}: UnsignedAccountAssociation): Promise<SignedAccountAssociation> {
  if (!id || !mnemonic) {
    console.warn(`Missing farcaster id and/or mnemonic, skipping account association signing`);
    return {
      header: '',
      payload: '',
      signature: '',
    };
  }

  const account = mnemonicToAccount(mnemonic);
  if (!account) {
    throw new Error('Invalid mnemonic provided');
  }
  const header = {
    fid: id,
    type: 'custody',
    key: account.address, // custody address of the account
  };
  const encodedHeader = Buffer.from(JSON.stringify(header), 'utf-8').toString('base64url');
  const payload = { domain };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = await account.signMessage({
    message: `${encodedHeader}.${encodedPayload}`,
  });
  const encodedSignature = Buffer.from(signature.slice(2), 'hex').toString('base64url');
  return {
    header: encodedHeader,
    payload: encodedPayload,
    signature: encodedSignature,
  };
}

async function getAccountAssociation(
  account: SignedAccountAssociation | UnsignedAccountAssociation
): Promise<SignedAccountAssociation> {
  if ('mnemonic' in account) {
    return signAccountAssociation(account);
  } else {
    if (!account.header || !account.payload || !account.signature) {
      throw new Error('Invalid signed account association provided');
    }
    return account;
  }
}

function isBasicDomain(domain: string): boolean {
  return (
    /^[a-zA-Z0-9.-]+$/.test(domain) && domain.length <= 253 && domain.split('.').every(Boolean)
  );
}

function isBasicString(value: string, maxLength: number): boolean {
  return value.length > 0 && value.length <= maxLength && /^[a-zA-Z0-9 ,-]+$/.test(value);
}

function isHttpsUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === parsedUrl.host && parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

function isHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isMiniAppManifestInvalid({
  version,
  name,
  canonicalDomain,
  homeUrl,
  iconUrl,
  splashImageUrl,
  splashBackgroundColor,
  subtitle,
  description,
  screenshotUrls,
  primaryCategory,
  tags,
  heroImageUrl,
  tagline,
  requiredCapabilities,
  ogTitle,
  ogDescription,
  ogImageUrl,
  noindex,
}: MiniAppManifest) {
  const errors: Array<{ field: string; message: string }> = [];
  if (version !== '1') {
    errors.push({ field: 'version', message: 'Version must be "1"' });
  }
  if (!name || !isBasicString(name, 32)) {
    errors.push({
      field: 'name',
      message: 'Name must be max 32 characters, no special characters',
    });
  }
  if (!canonicalDomain || !isBasicDomain(canonicalDomain)) {
    errors.push({ field: 'canonicalDomain', message: 'Canonical domain must hostname only' });
  }
  if (!homeUrl || !isHttpsUrl(homeUrl)) {
    errors.push({ field: 'homeUrl', message: 'Home URL must be a valid HTTPS URL' });
  }
  if (!iconUrl || !isHttpsUrl(iconUrl)) {
    errors.push({ field: 'iconUrl', message: 'Icon URL must be a valid HTTPS URL' });
  }
  if (!splashImageUrl || !isHttpsUrl(splashImageUrl)) {
    errors.push({ field: 'splashImageUrl', message: 'Splash image URL must be a valid HTTPS URL' });
  }
  if (!splashBackgroundColor || !isHexColor(splashBackgroundColor)) {
    errors.push({
      field: 'splashBackgroundColor',
      message: 'Splash background color must be a valid hex color',
    });
  }
  if (!subtitle || !isBasicString(subtitle, 30)) {
    errors.push({
      field: 'subtitle',
      message: 'Subtitle must be max 30 characters, no special characters',
    });
  }
  if (!description || !isBasicString(description, 170)) {
    errors.push({
      field: 'description',
      message: 'Description must be max 170 characters, no special characters',
    });
  }
  if (
    !Array.isArray(screenshotUrls) ||
    screenshotUrls.length === 0 ||
    !screenshotUrls.every(url => isHttpsUrl(url))
  ) {
    errors.push({
      field: 'screenshotUrls',
      message: 'Screenshot URLs must be an array of valid HTTPS URLs',
    });
  }
  if (!primaryCategory || !miniAppCategories.includes(primaryCategory)) {
    errors.push({
      field: 'primaryCategory',
      message: `Primary category must be one of: ${miniAppCategories.join(', ')}`,
    });
  }
  if (!Array.isArray(tags) || tags.length > 5 || !tags.every(tag => isBasicString(tag, 20))) {
    errors.push({
      field: 'tags',
      message:
        'Tags must be an array of max 5 tags, each max 20 characters, lower case, no spaces, no special characters',
    });
  }
  if (heroImageUrl && !isHttpsUrl(heroImageUrl)) {
    errors.push({ field: 'heroImageUrl', message: 'Hero image URL must be a valid HTTPS URL' });
  }
  if (tagline && !isBasicString(tagline, 30)) {
    errors.push({
      field: 'tagline',
      message: 'Tagline must be max 30 characters, no special characters',
    });
  }
  if (ogTitle && !isBasicString(ogTitle, 30)) {
    errors.push({
      field: 'ogTitle',
      message: 'OG title must be max 30 characters, no special characters',
    });
  }
  if (ogDescription && !isBasicString(ogDescription, 170)) {
    errors.push({
      field: 'ogDescription',
      message: 'OG description must be max 170 characters, no special characters',
    });
  }
  if (ogImageUrl && !isHttpsUrl(ogImageUrl)) {
    errors.push({ field: 'ogImageUrl', message: 'OG image URL must be a valid HTTPS URL' });
  }
  if (
    requiredCapabilities &&
    (!Array.isArray(requiredCapabilities) ||
      requiredCapabilities.length === 0 ||
      !requiredCapabilities.every(cap => miniAppHostCapabilityList.includes(cap)))
  ) {
    errors.push({
      field: 'requiredCapabilities',
      message: `Required capabilities must be an array of valid capabilities: ${miniAppHostCapabilityList.join(', ')}`,
    });
  }
  if (noindex !== undefined && typeof noindex !== 'boolean') {
    errors.push({
      field: 'noindex',
      message: 'Noindex must be a boolean value',
    });
  }

  return errors.length ? errors : undefined;
}

function isMiniAppEmbedValid({ version, imageUrl, button }: MiniAppEmbed) {
  const errors: Array<{ field: string; message: string }> = [];

  if (version !== '1') {
    errors.push({ field: 'version', message: 'Version must be "1"' });
  }

  if (!imageUrl || !isHttpsUrl(imageUrl)) {
    errors.push({ field: 'imageUrl', message: 'Image URL must be a valid HTTPS URL' });
  }

  if (!button?.title || button.title.length === 0 || button.title.length > 30) {
    errors.push({
      field: 'button.title',
      message: 'Button title must be a non-empty string with max 30 characters',
    });
  }

  if (!button?.action?.type || button.action.type !== 'launch_miniapp') {
    errors.push({
      field: 'button.action',
      message: 'Button action must be of type "launch_miniapp"',
    });
  }

  if (!button?.action?.url || !isHttpsUrl(button.action.url)) {
    errors.push({
      field: 'button.action.url',
      message: 'Button action URL must be a valid HTTPS URL',
    });
  }

  return errors.length ? errors : undefined;
}

async function emitAssetGetUrl(baseUrl: string, originalPath: string, context: PluginContext) {
  const id = context.emitFile({
    name: basename(originalPath),
    type: 'asset',
    source: await readFile(originalPath),
    originalFileName: originalPath,
  });
  return `${baseUrl}/${context.getFileName(id)}`;
}

// https://farcaster.xyz/miniapps/qItemA9Tveop/beefy for miniapp.beefy.rodeo

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function (options: MiniAppPluginOptions): Plugin {
  const baseUrl = `https://${options.domain}`;
  let embedImageUrl: string | undefined;

  return {
    name: 'miniapp-plugin',
    apply: 'build',
    async buildStart() {
      this.addWatchFile(options.splashImagePath);
      this.addWatchFile(options.iconPath);
      this.addWatchFile(options.heroImagePath);
      this.addWatchFile(options.embedImagePath);
      for (const screenshotPath of options.screenshotPaths) {
        this.addWatchFile(screenshotPath);
      }
      if (options.ogImagePath) {
        this.addWatchFile(options.ogImagePath);
      }
    },
    async generateBundle(_options, _bundle) {
      const [
        accountAssociation,
        _embedImageUrl,
        iconUrl,
        splashImageUrl,
        heroImageUrl,
        ogImageUrl,
        ...screenshotUrls
      ] = await Promise.all([
        getAccountAssociation(options.account),
        emitAssetGetUrl(baseUrl, options.embedImagePath, this),
        emitAssetGetUrl(baseUrl, options.iconPath, this),
        emitAssetGetUrl(baseUrl, options.splashImagePath, this),
        emitAssetGetUrl(baseUrl, options.heroImagePath, this),
        emitAssetGetUrl(baseUrl, options.ogImagePath || options.heroImagePath, this),
        ...options.screenshotPaths.map(originalPath =>
          emitAssetGetUrl(baseUrl, originalPath, this)
        ),
      ]);
      // set for use in transformIndexHtml
      embedImageUrl = _embedImageUrl;

      const manifest: MiniAppManifest = {
        version: '1',
        name: options.name,
        canonicalDomain: options.domain,
        homeUrl: baseUrl,
        iconUrl,
        splashImageUrl,
        splashBackgroundColor: options.splashBackgroundColor,
        subtitle: options.subtitle,
        description: options.description,
        screenshotUrls,
        primaryCategory: options.category,
        tags: options.tags,
        heroImageUrl,
        tagline: options.tagline || options.subtitle,
        ogTitle: options.ogTitle || options.name,
        ogDescription: options.ogDescription || options.description,
        ogImageUrl,
        requiredCapabilities: options.capabilities,
        noindex: options.noindex,
      };
      const manifestErrors = isMiniAppManifestInvalid(manifest);
      if (manifestErrors) {
        throw new Error(
          `MiniApp manifest validation failed:\n` +
            manifestErrors.map(err => `- ${err.field}: ${err.message}`).join('\n')
        );
      }

      if (!options.baseBuilderAddresses.length) {
        throw new Error(`Base builder addresses must be provided.`);
      }
      const baseBuilder = {
        allowedAddresses: options.baseBuilderAddresses,
      };

      this.emitFile({
        fileName: '.well-known/farcaster.json',
        type: 'asset',
        source: JSON.stringify({ accountAssociation, miniapp: manifest, baseBuilder }, null, 2),
      });
    },
    async transformIndexHtml(_html, _ctx) {
      if (!embedImageUrl) {
        throw new Error(`Embed image URL is not set.`);
      }

      const embed: MiniAppEmbed = {
        version: '1',
        imageUrl: embedImageUrl,
        button: {
          title: options.tagline || options.subtitle,
          action: {
            name: options.name,
            type: 'launch_miniapp',
            url: baseUrl,
          },
        },
      };

      const embedErrors = isMiniAppEmbedValid(embed);
      if (embedErrors) {
        throw new Error(
          `MiniApp embed validation failed:\n` +
            embedErrors.map(err => `- ${err.field}: ${err.message}`).join('\n')
        );
      }

      return [
        {
          tag: 'meta',
          attrs: {
            name: 'fc:miniapp',
            content: JSON.stringify(embed),
          },
          injectTo: 'head',
        },
      ];
    },
  };
}
