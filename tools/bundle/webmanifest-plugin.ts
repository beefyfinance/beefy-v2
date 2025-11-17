import { type Plugin } from 'vite';
import type { PluginContext } from 'rollup';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { HeadersFilePlugin, HeadersFilePluginApi } from './headers-file-plugin.ts';

type Icon = {
  src: string;
  type: string;
  sizes: string;
};

type Shortcut = {
  name: string;
  short_name: string;
  description: string;
  url: string;
  icons: Icon[];
};

type ShortcutOption = Omit<Shortcut, 'short_name'> & {
  /** defaults to `name` */
  short_name?: string;
};

type Screenshot = {
  src: string;
  type: string;
  sizes: string;
  form_factor?: 'narrow' | 'wide';
};

type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

export type WebManifest = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  icons: Icon[];
  background_color: string;
  theme_color: string;
  display: DisplayMode;
  shortcuts?: Shortcut[];
  display_override?: DisplayMode[];
  screenshots?: Screenshot[];
};

export type WebManifestPluginOptions = Omit<
  WebManifest,
  'short_name' | 'id' | 'display' | 'scope' | 'shortcuts'
> & {
  /** defaults to `name` */
  short_name?: WebManifest['short_name'];
  /** defaults to `start_url` */
  id?: WebManifest['id'];
  /** defaults to 'browser' */
  display?: WebManifest['display'];
  /** defaults to '/' */
  scope?: WebManifest['scope'];
  /** shortcuts with optional short_name */
  shortcuts?: ShortcutOption[];
};

function isHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isWebManifestInvalid({
  id,
  name,
  short_name,
  description,
  start_url,
  icons,
  background_color,
  theme_color,
  display,
  scope,
  shortcuts,
  display_override,
  screenshots,
}: WebManifest) {
  const validDisplayModes: DisplayMode[] = ['standalone', 'fullscreen', 'minimal-ui', 'browser'];
  const errors: Array<{ field: string; message: string }> = [];
  if (!id || !id.startsWith('/')) {
    errors.push({ field: 'id', message: 'ID must be a non-empty string and start with "/"' });
  }
  if (!name) {
    errors.push({
      field: 'name',
      message: 'Name must be defined and non-empty',
    });
  }
  if (!short_name) {
    errors.push({
      field: 'short_name',
      message: 'Short name must be defined and non-empty',
    });
  }
  if (!description) {
    errors.push({
      field: 'description',
      message: 'Description must be defined and non-empty',
    });
  }
  if (!start_url || !start_url.startsWith('/')) {
    errors.push({
      field: 'start_url',
      message: 'Start URL must be a non-empty string and start with "/"',
    });
  }
  if (!scope || !scope.startsWith('/')) {
    errors.push({
      field: 'scope',
      message: 'Scope must be a non-empty string and start with "/"',
    });
  }
  if (!Array.isArray(icons) || icons.length === 0) {
    errors.push({ field: 'icons', message: 'Icons must be a non-empty array' });
  } else {
    icons.map(isIconValid).forEach((iconErrors, i) => {
      if (iconErrors) {
        for (const error of iconErrors) {
          errors.push({ field: `icons[${i}].${error.field}`, message: error.message });
        }
      }
    });
  }
  if (!isHexColor(background_color)) {
    errors.push({
      field: 'background_color',
      message: 'Background color must be a valid hex color (e.g., #FFFFFF)',
    });
  }
  if (!isHexColor(theme_color)) {
    errors.push({
      field: 'theme_color',
      message: 'Theme color must be a valid hex color (e.g., #FFFFFF)',
    });
  }
  if (!validDisplayModes.includes(display)) {
    errors.push({
      field: 'display',
      message: 'Display must be one of "standalone", "fullscreen", "minimal-ui", or "browser"',
    });
  }
  if (shortcuts) {
    if (!Array.isArray(shortcuts)) {
      errors.push({ field: 'shortcuts', message: 'Shortcuts must be an array' });
    } else {
      shortcuts.map(isShortcutValid).forEach((shortcutErrors, i) => {
        if (shortcutErrors) {
          for (const error of shortcutErrors) {
            errors.push({ field: `shortcuts[${i}].${error.field}`, message: error.message });
          }
        }
      });
    }
  }
  if (display_override) {
    if (!Array.isArray(display_override) || display_override.length === 0) {
      errors.push({
        field: 'display_override',
        message: 'Display override must be a non-empty array if provided',
      });
    } else if (!display_override.every(mode => validDisplayModes.includes(mode))) {
      errors.push({
        field: 'display_override',
        message:
          'Each display override must be one of "standalone", "fullscreen", "minimal-ui", or "browser"',
      });
    }
  }
  if (screenshots) {
    if (!Array.isArray(screenshots) || screenshots.length === 0) {
      errors.push({
        field: 'screenshots',
        message: 'Screenshots must be a non-empty array if provided',
      });
    } else {
      screenshots.map(isScreenshotValid).forEach((screenshotErrors, i) => {
        if (screenshotErrors) {
          for (const error of screenshotErrors) {
            errors.push({ field: `screenshots[${i}].${error.field}`, message: error.message });
          }
        }
      });
    }
  }

  return errors.length ? errors : undefined;
}

function isScreenshotValid({ form_factor, ...icon }: Screenshot) {
  const validFormFactors = ['narrow', 'wide'];
  const screenshotErrors: Array<{ field: string; message: string }> = isIconValid(icon) || [];
  if (form_factor) {
    if (!validFormFactors.includes(form_factor)) {
      screenshotErrors.push({
        field: 'form_factor',
        message: 'Screenshot form_factor must be either "narrow" or "wide" if provided',
      });
    }
  }
  return screenshotErrors.length ? screenshotErrors : undefined;
}

function isIconValid({ src, type, sizes }: Icon) {
  const iconErrors: Array<{ field: string; message: string }> = [];
  if (!src || !src.startsWith('/')) {
    iconErrors.push({
      field: 'src',
      message: 'Icon src must be a valid non-empty string and start with "/"',
    });
  }
  if (!type || !/^image\/(png|jpeg|svg\+xml|webp)$/.test(type)) {
    iconErrors.push({
      field: 'type',
      message:
        'Icon type must be one of "image/png", "image/jpeg", "image/svg+xml", or "image/webp"',
    });
  }
  if (!sizes || !/^\d+x\d+$/.test(sizes)) {
    iconErrors.push({
      field: 'sizes',
      message: 'Icon sizes must be in the format "WIDTHxHEIGHT" (e.g., "48x48")',
    });
  }
  return iconErrors.length ? iconErrors : undefined;
}

function isShortcutValid({ name, short_name, description, url, icons }: Shortcut) {
  const errors: Array<{ field: string; message: string }> = [];

  if (!name) {
    errors.push({
      field: 'name',
      message: 'Shortcut name must be defined and non-empty',
    });
  }
  if (!short_name) {
    errors.push({
      field: 'short_name',
      message: 'Shortcut short_name must be defined and non-empty',
    });
  }
  if (!description) {
    errors.push({
      field: 'description',
      message: 'Shortcut description must be defined and non-empty',
    });
  }
  if (!url || url.startsWith('/')) {
    errors.push({
      field: 'url',
      message: 'Shortcut url must be a valid non-empty string and not start with "/"',
    });
  }
  if (!Array.isArray(icons) || icons.length === 0) {
    errors.push({ field: 'icons', message: 'Shortcut icons must be a non-empty array' });
  } else {
    icons.map(isIconValid).forEach((iconErrors, i) => {
      if (iconErrors) {
        for (const error of iconErrors) {
          errors.push({ field: `icons[${i}].${error.field}`, message: error.message });
        }
      }
    });
  }

  return errors.length ? errors : undefined;
}

async function emitAssetGetPath(originalPath: string, context: PluginContext) {
  const id = context.emitFile({
    name: basename(originalPath),
    type: 'asset',
    source: await readFile(originalPath),
    originalFileName: originalPath,
  });
  return `/${context.getFileName(id)}`;
}

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function (options: WebManifestPluginOptions): Plugin {
  let headersApi: HeadersFilePluginApi | undefined;

  return {
    name: 'webmanifest-plugin',
    apply: 'build',
    async buildStart({ plugins }) {
      const headersPlugin = plugins.find(
        (p): p is HeadersFilePlugin => p.name === 'headers-file-plugin'
      );
      headersApi = headersPlugin?.api || undefined;

      for (const iconPath of options.icons.map(icon => icon.src)) {
        this.addWatchFile(iconPath);
      }
      if (options.shortcuts) {
        for (const shortcut of options.shortcuts) {
          for (const iconPath of shortcut.icons.map(icon => icon.src)) {
            this.addWatchFile(iconPath);
          }
        }
      }
    },
    async generateBundle(_options, _bundle) {
      const [iconPaths, shortcutIconPaths, screenshotPaths] = await Promise.all([
        Promise.all(options.icons.map(icon => emitAssetGetPath(icon.src, this))),
        options.shortcuts ?
          Promise.all(
            options.shortcuts.map(shortcut =>
              Promise.all(shortcut.icons.map(icon => emitAssetGetPath(icon.src, this)))
            )
          )
        : Promise.resolve([]),
        options.screenshots ?
          Promise.all(options.screenshots.map(screenshot => emitAssetGetPath(screenshot.src, this)))
        : Promise.resolve([]),
      ]);

      const manifest: WebManifest = {
        id: options.id || options.start_url,
        name: options.name,
        short_name: options.short_name || options.name,
        description: options.description,
        start_url: options.start_url,
        scope: options.scope || '/',
        icons: options.icons.map((icon, index) => ({
          src: iconPaths[index],
          type: icon.type,
          sizes: icon.sizes,
        })),
        background_color: options.background_color,
        theme_color: options.theme_color,
        display: options.display || 'browser',
        shortcuts:
          options.shortcuts ?
            options.shortcuts.map((shortcut, sIndex) => ({
              name: shortcut.name,
              short_name: shortcut.short_name || shortcut.name,
              description: shortcut.description,
              url: shortcut.url,
              icons: shortcut.icons.map((icon, iIndex) => ({
                src: shortcutIconPaths[sIndex][iIndex],
                type: icon.type,
                sizes: icon.sizes,
              })),
            }))
          : undefined,
        display_override: options.display_override,
        screenshots:
          options.screenshots ?
            options.screenshots.map((screenshot, index) => ({
              src: screenshotPaths[index],
              type: screenshot.type,
              sizes: screenshot.sizes,
              form_factor: screenshot.form_factor,
            }))
          : undefined,
      };

      for (const [key, value] of Object.entries(manifest)) {
        if (value === undefined) {
          delete manifest[key as keyof WebManifest];
        }
      }
      for (const shortcut of manifest.shortcuts || []) {
        for (const [key, value] of Object.entries(shortcut)) {
          if (value === undefined) {
            delete shortcut[key as keyof Shortcut];
          }
        }
      }

      const errors = isWebManifestInvalid(manifest);
      if (errors) {
        throw new Error(
          `WebManifest validation failed:\n` +
            errors.map(err => `- ${err.field}: ${err.message}`).join('\n')
        );
      }
      this.emitFile({
        fileName: 'manifest.json',
        type: 'asset',
        source: JSON.stringify(manifest, null, 2),
      });

      if (headersApi) {
        headersApi.addHeaders('/manifest.json', [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ]);
      } else {
        console.warn(
          `webmanifest-plugin: headers-file-plugin not found, skipping adding cors headers for manifest.json`
        );
      }
    },
    async transformIndexHtml(_html, _ctx) {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'manifest',
            href: '/manifest.json',
          },
          injectTo: 'head',
        },
      ];
    },
  };
}
