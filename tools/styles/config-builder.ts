import type {
  Config,
  Recursive,
  SemanticTokens,
  TextStyle,
  TextStyles,
  Token,
  Tokens,
} from '@pandacss/types';
import { defineTextStyles } from '@pandacss/dev';
import { defaults, mapValues } from 'lodash-es';
import { setColorOpacity } from './utils/color.ts';

export type ButtonColors = { color: string; background: string; border: string };
export type Button = {
  base: ButtonColors;
  hover?: Partial<ButtonColors>;
  active?: Partial<ButtonColors>;
  disabled?: Partial<ButtonColors>;
};

type PrimarySecondary<T = string> = { primary: T; secondary?: T };

export type Network = PrimarySecondary & {
  header?: number | string | PrimarySecondary<number | string>;
};

const zIndexStride = 1000;

function buildValue(value: string, description?: string): { value: string; description?: string } {
  return description ? { value, description } : { value };
}

function buildButtonState(variant: string, state: string, colors: ButtonColors) {
  return {
    color: buildValue(colors.color, `The color of the ${variant} button in the ${state} state`),
    background: buildValue(
      colors.background,
      `The background color of the ${variant} button in the ${state} state`
    ),
    border: buildValue(
      colors.border,
      `The border color of the ${variant} button in the ${state} state`
    ),
  };
}

function buildButtonsColors(buttons: Record<string, Button>): SemanticTokens['colors'] {
  return mapValues(buttons, (button, variant) => ({
    ...buildButtonState(variant, 'base', button.base),
    hover: buildButtonState(variant, 'hover', defaults(button.hover || {}, button.base)),
    active: buildButtonState(
      variant,
      'active',
      defaults(button.active || {}, button.hover || {}, button.base)
    ),
    disabled: buildButtonState(variant, 'disabled', defaults(button.disabled || {}, button.base)),
  }));
}

function addButtons(config: Config, buttons: Record<string, Button>): Config {
  config.theme ??= {};
  config.theme.semanticTokens ??= {};
  config.theme.semanticTokens.colors ??= {};
  config.theme.semanticTokens.colors.buttons = {
    ...(config.theme.semanticTokens.colors.buttons || {}),
    ...buildButtonsColors(buttons),
  };

  return config;
}

function buildZIndex(
  zIndex: Record<string, number>,
  layer: number
): Exclude<Tokens['zIndex'], undefined> {
  const base = layer * zIndexStride;
  return Object.assign(
    { DEFAULT: { value: base, description: `The base z-index of layer ${layer}` } },
    mapValues(zIndex, (value, key) => ({
      value: base + value,
      description: `The z-index of ${key} on layer ${layer}`,
    }))
  );
}

function addZIndex(config: Config, zIndex: Record<string, number>): Config {
  config.theme ??= {};
  config.theme.tokens ??= {};
  config.theme.tokens.zIndex = {
    ...(config.theme.tokens.zIndex || {}),
    ...buildZIndex(zIndex, 0),
    layer1: buildZIndex(zIndex, 1),
    layer2: buildZIndex(zIndex, 2),
  };

  return config;
}

export type BuilderConfig = {
  buttons?: Record<string, Button>;
  zIndex?: Record<string, number>;
  textStyles?: Record<string, TextStyle>;
  networks?: Record<string, Network>;
};

function isTokenTextStyle(
  obj: Recursive<Token<TextStyle>> | Token<TextStyle>
): obj is Token<TextStyle> {
  return 'value' in obj;
}

function addTextStyles(config: Config, textStyles: Record<string, TextStyle>): Config {
  config.theme ??= {};

  // dot notation to nested object
  const keys = Object.keys(textStyles).sort((a, b) => a.length - b.length);
  const tree: TextStyles = {};
  for (const key of keys) {
    if (!key.includes('.')) {
      tree[key] = { value: textStyles[key] };
      continue;
    }
    const parts = key.split('.');
    let parent = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const child = parent[part];
      if (child && isTokenTextStyle(child)) {
        parent = child as unknown as TextStyles;
        parent['DEFAULT'] = { value: child.value };
        delete parent.value;
      } else if (i === parts.length - 1) {
        parent[part] = { value: textStyles[key] };
      } else {
        parent = child as TextStyles;
      }
    }
  }

  config.theme.textStyles = defineTextStyles(tree);

  return config;
}

function addNetworks(
  config: Config,
  networks: Record<string, Network>,
  defaultHeaderOpacity: number = 1
): Config {
  const chainIds = Object.keys(networks).sort();
  const tokens: SemanticTokens['colors'] = {};

  for (const chainId of chainIds) {
    const network = networks[chainId];

    tokens[chainId] = {
      primary: buildValue(network.primary, `The primary color of the ${chainId} network`),
    };

    if (network.secondary) {
      tokens[chainId].secondary = buildValue(
        network.secondary,
        `The secondary color of the ${chainId} network`
      );
    }

    let primaryColor: string = setColorOpacity(network.primary, defaultHeaderOpacity);
    let secondaryColor: string | undefined = network.secondary
      ? setColorOpacity(network.secondary, defaultHeaderOpacity)
      : undefined;

    if (typeof network.header !== 'undefined') {
      const primaryColorOrOpacity =
        typeof network.header === 'object' ? network.header.primary : network.header;
      primaryColor =
        typeof primaryColorOrOpacity === 'number'
          ? setColorOpacity(network.primary, primaryColorOrOpacity)
          : primaryColorOrOpacity;

      const secondaryColorOrOpacity =
        typeof network.header === 'object' ? network.header.secondary : undefined;

      if (typeof secondaryColorOrOpacity !== 'undefined') {
        if (typeof secondaryColorOrOpacity === 'number') {
          if (!network.secondary) {
            throw new Error(
              `Secondary color is not defined for the ${chainId} network, but opacity is set for header.secondary`
            );
          }
          secondaryColor = setColorOpacity(network.secondary, secondaryColorOrOpacity);
        } else {
          secondaryColor = secondaryColorOrOpacity;
        }
      }
    }

    tokens[chainId].header = {
      primary: buildValue(primaryColor, `The primary color of the ${chainId} network header`),
    };
    if (secondaryColor) {
      tokens[chainId].header.secondary = buildValue(
        secondaryColor,
        `The secondary color of the ${chainId} network header`
      );
    }
  }

  config.theme ??= {};
  config.theme.semanticTokens ??= {};
  config.theme.semanticTokens.colors ??= {};
  config.theme.semanticTokens.colors.network = tokens;

  // Output all color palettes to the stylesheet, allowing us to apply these dynamically
  config.staticCss ??= {};
  config.staticCss.css ??= [];
  config.staticCss.css.push({
    properties: {
      colorPalette: chainIds.map(chainId => `network.${chainId}`),
    },
  });

  return config;
}

/** @dev mutates the config */
export function buildConfig(config: Config, builderConfig: BuilderConfig): Config {
  if (builderConfig.buttons) {
    addButtons(config, builderConfig.buttons);
  }
  if (builderConfig.zIndex) {
    addZIndex(config, builderConfig.zIndex);
  }
  if (builderConfig.textStyles) {
    addTextStyles(config, builderConfig.textStyles);
  }
  if (builderConfig.networks) {
    addNetworks(config, builderConfig.networks);
  }
  return config;
}
