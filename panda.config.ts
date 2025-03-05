import { defineConfig } from '@pandacss/dev';
import { buildConfig } from './tools/styles/config-builder.ts';
import { pluginStricterProperties } from './tools/styles/stricter-properties-plugin.ts';
import { pluginMoreTypes } from './tools/styles/more-types-plugin.ts';
import basePreset from '@pandacss/preset-base';

/**
 * @dev some changes require running `npx panda codegen` after
 */

const isProduction = process.env['NODE_ENV'] === 'production';

const sansSerifFontStack = [
  'DM Sans',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'Noto Sans',
  'Liberation Sans',
  'sans-serif',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol',
  'Noto Color Emoji',
]
  .map(v => (v.includes(' ') ? `"${v}"` : v))
  .join(', ');

// We only want to use (some of) the utilities and conditions from the base preset
const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- removing backdropFilter
  utilities: { backdropFilter, ...baseUtilities },
  conditions: baseConditions,
} = basePreset;

const config = buildConfig(
  // Base config
  {
    // Enabled jsx/styled() support
    jsxFramework: 'react',
    // jsx/styled() can only be used for recipes
    jsxStyleProps: 'minimal',
    // Typescript validation for some supported properties
    // @see https://panda-css.com/docs/concepts/writing-styles#strictpropertyvalues
    strictPropertyValues: true,
    // For any css property with a token set, only tokens can be used if this is enabled
    strictTokens: false,
    // error if this config is not valid
    validation: 'error',
    // The output directory for your css system
    outdir: '.cache/styles',
    // Tell panda we are importing generated code from @styles/* rather than {outdir}/*
    importMap: '@repo/styles', // TODO when eslint-plugin-import with 'pathGroupOverrides' is released, change this to #/styles instead
    // Remove presets
    presets: [],
    eject: true,
    // Whether to use css reset
    preflight: true,
    // Where to look for your css declarations
    include: ['./src/**/*.{ts,tsx}'],
    // Hash classnames/variables
    hash: isProduction ? { cssVar: true, className: true } : false,
    // Minifiy output
    minify: isProduction,
    // Use lightningcss instead of postcss
    lightningcss: true,
    // Browserslist for lightningcss
    browserslist: isProduction
      ? [
          '>0.1% and fully supports es6-module and fully supports es6-module-dynamic-import',
          'not dead',
          'not op_mini all',
        ]
      : ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
    // Where css variables are defined
    cssVarRoot: ':root',
    // Plugins
    plugins: [
      pluginMoreTypes(),
      pluginStricterProperties({
        zIndex: {
          removeAny: true,
          removeReact: true,
          add: ['number', '"auto"'],
        },
      }),
    ],
    // Global css declarations
    globalCss: {
      ':root': {
        // Panda
        '--global-font-body': sansSerifFontStack,
        // '--global-font-mono': '',
        // '--global-color-border': '',
        // '--global-color-placeholder': '',
        // Onboard Modal
        '--onboard-font-family-normal': '{fonts.body}',
        '--onboard-font-family-semibold': '{fonts.body}',
        '--onboard-font-family-light': '{fonts.body}',
        '--onboard-modal-z-index': '{zIndex.modal}',
        '--onboard-modal-backdrop': '{colors.modal.backdrop}',
        '--onboard-modal-border-radius': '20px',
        '--onboard-wallet-button-border-radius': '8px',
        '--onboard-connect-header-background': '{colors.eclipseElixir}',
        '--onboard-connect-header-color': '{colors.text.light}',
        '--onboard-modal-color': '{colors.text.light}',
        '--onboard-modal-background': '{colors.blackMarket1}',
        '--onboard-main-scroll-container-background': '{colors.blackMarket1}',
        '--onboard-close-button-background': '{colors.blackMarket1}',
        '--onboard-close-button-color': '{colors.text.middle}',
        '--onboard-wallet-button-border-color': '{colors.blackMarket1}',
        '--onboard-wallet-button-background': '{colors.background.content.light}',
        '--onboard-wallet-button-color': '{colors.text.middle}',
        '--onboard-wallet-button-background-hover': '{colors.extracted3438}',
        '--onboard-wallet-button-color-hover': '{colors.text.lightest}',
        '--onboard-wallet-app-icon-border-color': '{colors.text.lightest}',
        '--onboard-wallet-app-icon-background-transparent': '{colors.text.lightest}',
        '--onboard-connect-sidebar-background': '{colors.background.header}',
        '--onboard-connect-sidebar-color': '{colors.text.light}',
        '--onboard-connect-sidebar-progress-color': '{colors.greenLight}',
        '--onboard-connect-sidebar-progress-background': '{colors.green}',
        '--onboard-link-color': '{colors.text.dark}',
        // TODO use tokens directly
        // '--tooltip-content-vertical-padding': '12px',
        // '--tooltip-content-horizontal-padding': '16px',
        // '--tooltip-content-vertical-gap': '8px',
        // '--tooltip-content-horizontal-gap': '24px',
        // '--tooltip-content-border-radius': '8px',
        // '--tooltip-background-color': '{colors.tooltip.light.background}',
        // '--tooltip-title-color': '{colors.tooltip.light.text.title}',
        // '--tooltip-content-color': '{colors.tooltip.light.text.content}',
        // '--tooltip-value-color': '{colors.tooltip.light.text}',
        // '--tooltip-label-color': '{colors.tooltip.light.text.label}',
        // '--tooltip-link-color': '{colors.tooltip.light.text.link}',
        // '--tooltip-body-font-size': '{fontSizes.body}',
        // '--tooltip-subline-font-size': '{fontSizes.subline}',
      },
      html: {
        color: 'text.light',
        background: 'background.body',
        '&:has(.disable-scroll)': {
          overflow: 'hidden',
          '& body': { paddingLeft: 'calc(100vw - 100%)' },
        },
      },
      h1: {
        fontSize: '32px',
        lineHeight: '40px',
        fontWeight: 500,
      },
      h2: {
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: 500,
      },
      h3: {
        fontSize: '21px',
        lineHeight: '24px',
        fontWeight: 500,
      },
      button: {
        color: 'inherit',
        background: 'none',
        border: 'none',
        borderRadius: 0,
        minWidth: 0,
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: 'none',
        textAlign: 'center',
        textDecoration: 'none',
        outline: 'none',
        '&:focus,&:focus-visible': {
          outline: 'none',
        },
        '&:disabled,&:hover:disabled,&:active:disabled,&:focus:disabled': {
          color: 'inherit',
          background: 'none',
          border: 'none',
          pointerEvents: 'none',
        },
      },
      input: {
        textStyle: 'body.med',
        margin: 0,
        display: 'block',
        minWidth: '20px',
      },
      'onboard-v2': {
        position: 'relative!',
        zIndex: 'layer1.modal!',
      },
      'wcm-modal, #cryptoconnect-extension': {
        position: 'relative!',
        zIndex: 'layer2.modal!',
      },
      '.mui-svg': {
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        fontSize: '1.5rem',
        flexShrink: '0',
        userSelect: 'none',
      },
      '.scrollbar': {
        '&::-webkit-scrollbar': {
          width: '0.5rem',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '{colors.scrollbar.thumb}',
          borderRadius: '0.5rem',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '{colors.scrollbar.track}',
          borderRadius: '0',
        },
        '@supports not selector(::-webkit-scrollbar)': {
          scrollbarWidth: 'thin',
          scrollbarColor: '{colors.scrollbar.thumb} {colors.scrollbar.track}',
        },
      },
    },
    // Shorthands
    utilities: baseUtilities,
    conditions: {
      ...baseConditions,
      // React Router sets aria-current="page" on the active link
      // Floating UI sets aria-expanded="true" on the button when open
      active: '&:is(:active, [data-active], [aria-current="page"], [aria-expanded="true"])',
    },
    // Theme variables
    theme: {
      breakpoints: {
        sm: '600px',
        md: '960px',
        lg: '1260px',
        xl: '1800px',
      },
      tokens: {
        fonts: {
          body: { value: sansSerifFontStack },
        },
        colors: {
          // TODO rename these colors
          red: { value: '#dc2c10', description: 'txsModal.error' },
          redOrange: { value: '#da5932', description: 'indicators.error' },
          orangeBoost: { value: '#db8332', description: 'boost button bg + vaults boost' },
          orangeWarning: { value: '#d19847', description: 'indicators.warning' },
          yellow: { value: '#d6d05d', description: 'indicators.loading' },
          orangeBoostLight: { value: '#e5a66b', description: 'boost button bg hover' },
          green: { value: '#4db258', description: 'primary main + indicators.success' },
          greenLight: { value: '#68be71', description: 'primary light' },
          greenDark: { value: '#004708', description: 'primary dark' },
          wildBillBrown: { value: '#775744', description: 'tag.boost' },
          portRoyale: { value: '#532f39', description: 'tag.retired' },
          molasses: { value: '#564a46', description: 'tag.paused' },
          blackOff: { value: '#020203', description: 'footer header' },
          purpleDarkest: { value: '#121421', description: 'app bg + search input bg' },
          eclipseElixir: {
            value: '#1c1e32',
            description:
              'light tooltip text title/content/label/link + contentDark + tooltip dark bg',
          },
          faintingLight: { value: '#1e2a48', description: 'vaults clmVault' },
          blackMarket2: { value: '#232644', description: 'dashboard summary icon bg' },
          blackVelvet: { value: '#242032', description: 'vaults inactive' },
          blackMarket1: {
            value: '#242842',
            description: 'light tooltip text value + contentPrimary + vaults.default + txsModal.bg',
          },
          underwaterRealm: { value: '#252c63', description: 'vaults clm + vaults clmPool' },
          quillTip: { value: '#2d3153', description: 'contentLight' },
          parisM: { value: '#322460', description: 'vaults gov' },
          bayOfMany: { value: '#363b63', description: 'border + button bg' },
          clematisBlue: { value: '#38428f', description: 'tag.platformClm' },
          blueGem: { value: '#4b388f', description: 'tag.platformGov' },
          blueJewel: { value: '#495086', description: 'button bg hover' },
          cornflower: { value: '#5c70d6', description: 'tag.clm + indicators.info' },
          grayDark: { value: '#999cb3', description: 'text dark' },
          gray: { value: '#d0d0da', description: 'text middle' },
          grayLight: { value: '#e5e5e5', description: 'txsModal.bgLine' },
          whiteOff: { value: '#f5f5f5', description: 'text light' },
          white: { value: '#ffffff', description: 'text lightest + txsModal.bg' },
          black: { value: '#000000' },
          mtPellerin: { value: '#121212' },
          // Network colors
          networkAurorao20: { value: '#70d44b33' },
          networkAvaxo20: { value: '#e7414233' },
          networkBsco20: { value: '#f0b90b33' },
          networkCantoo20: { value: '#06fc9933' },
          networkEmeraldo20: { value: '#0192f633' },
          networkEthereumo20: { value: '#627ee933' },
          networkFantomo20: { value: '#1969ff33' },
          networkFuseo20: { value: '#b4f9ba33' },
          networkHecoo20: { value: '#02943f33' },
          networkKavao20: { value: '#ff564f33' },
          networkLineaMantleFraxModeMtPellerino20: { value: '#12121233' },
          networkMetiso40: { value: '#00cfff66' },
          networkMoonbeamo40: { value: '#958fdc66' },
          networkMoonrivero40: { value: '#06353d66' },
          networkOptimismo20: { value: '#ff042033' },
          networkPolygono29: { value: '#f5f0fd4c' },
          networkZkevmo20: { value: '#8247e433' },
          // TODO rename or replace - extracted out of styles, some are chain brand colors
          // we can't use color-mix yet because of ios webview
          blacko20: { value: '#00000033' },
          blacko29: { value: '#0000004c' },
          blacko49: { value: '#0000007f' },
          extracted2201: { value: '#222222' },
          extracted3636: { value: '#111111' },
          extracted1308: { value: '#e84525' },
          extracted1355: { value: '#edc389' },
          extracted1401: { value: '#db323219' },
          extracted1758: { value: '#d153470c' },
          extracted2298: { value: '#d9d9d9' },
          extracted2530: { value: '#c9cbce' },
          extracted3438: { value: '#f5f5ff14' },
          extracted516: { value: '#ed9889' },
          extracted556: { value: '#e5484d' },
          extracted583: { value: '#d1534726' },
          orangeWarningo14: { value: '#d1984726' },
          orangeWarningo49: { value: '#d198477f' },
          redOrangeo49: { value: '#da59327f' },
          whiteo11: { value: '#ffffff1e' },
          whiteo15: { value: '#ffffff28' },
          whiteo20: { value: '#ffffff33' },
          whiteo37: { value: '#ffffff60' },
          extracted1306: { value: '#f3f3c87f' },
          extracted3194: { value: '#c2d65c' },
          extracted895: { value: '#fcfe5323' },
          extracted1431: { value: '#59a662' },
          extracted1431o14: { value: '#59a66226' },
          extracted1444: { value: '#389d44' },
          extracted3763: { value: '#509658' },
          extracted1302: { value: '#00d8af33' },
          extracted282: { value: '#23c197' },
          extracted2833: { value: '#30a46c' },
          extracted2615: { value: '#2e315000' },
          extracted2922: { value: '#3f446e' },
          extracted3658: { value: '#3f466d' },
          extracted790: { value: '#2e324c' },
          extracted1071: { value: '#6b7199' },
          extracted1885: { value: '#71aefe' },
          extracted2984: { value: '#8c93bf19' },
          extracted656: { value: '#289fef33' },
          cornflowero14: { value: '#5c70d626' },
          extracted1689: { value: '#3d5cf5' },
          extracted1757: { value: '#9873f0' },
          extracted2029: { value: '#8585a6' },
          extracted2048: { value: '#484f7f' },
          extracted2568: { value: '#9e8cfc' },
          extracted3604: { value: '#606fcf' },
          extracted3759: { value: '#cec0f0' },
          extracted3772: { value: '#424866' },
          extracted676: { value: '#9595b2' },
          extracted1571: { value: '#1c122c66' },
          extracted198: { value: '#313759' },
          extracted2015: { value: '#13112228' },
          extracted2310: { value: '#23274300' },
          extracted263: { value: '#232741' },
          extracted271: { value: '#363a61' },
          extracted2916: { value: '#373b60' },
          extracted3248: { value: '#373c63' },
          extracted668: { value: '#1b1d32' },
          extracted778: { value: '#14122133' },
          extracted946: { value: '#13112233' },
          extracted2805: { value: '#f02056' },
          blacko9: { value: '#00000019' },
          cornflowero13: { value: '#5c70d623' },
          extracted1757o11: { value: '#9873f01e' },
          extracted2298o28: { value: '#D9D9D949' },
          extracted2805o11: { value: '#f020561e' },
          extracted282o11: { value: '#23c1971e' },
          extracted3759o11: { value: '#CEC0F01e' },
          orangeWarningo48: { value: '#d198477c' },
          redOrangeo48: { value: '#da59327c' },
        },
        sizes: {
          defaultAssetsImageSize: { value: '48px' },
          container: {
            xs: { value: '444px' },
            sm: { value: '600px' },
            md: { value: '960px' },
            lg: { value: '1296px' },
          },
        },
        fontSizes: {
          h1: { value: '32px' },
          h2: { value: '24px' },
          h3: { value: '21px' },
          body: { DEFAULT: { value: '16px' }, sm: { value: '12px' } },
          subline: { DEFAULT: { value: '15px' }, sm: { value: '12px' } },
        },
        lineHeights: {
          h1: { value: '40px' },
          h2: { value: '32px' },
          h3: { value: '24px' },
          body: { DEFAULT: { value: '24px' }, sm: { value: '20px' } },
          subline: { DEFAULT: { value: '24px' }, sm: { value: '20px' } },
        },
        fontWeights: {
          normal: { value: 400 },
          medium: { value: 500 },
        },
        letterSpacings: {
          subline: { value: '0.5px' },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            lightest: { value: '{colors.white}' },
            light: { value: '{colors.whiteOff}' },
            middle: { value: '{colors.gray}' },
            dark: { value: '{colors.grayDark}' },
          },
          background: {
            header: { value: '{colors.blackOff}' },
            body: { value: '{colors.purpleDarkest}' },
            footer: { value: '{colors.blackOff}' },
            border: { value: '{colors.bayOfMany}' },
            button: { value: '{colors.bayOfMany}' },
            content: {
              DEFAULT: { value: '{colors.blackMarket1}' },
              dark: { value: '{colors.eclipseElixir}' },
              light: { value: '{colors.quillTip}' },
            },
            vaults: {
              standard: { value: '{colors.blackMarket1}' },
              gov: { value: '{colors.parisM}' },
              clm: {
                DEFAULT: { value: '{colors.underwaterRealm}' },
                pool: { value: '{colors.underwaterRealm}' },
                vault: { value: '{colors.faintingLight}' },
              },
              boost: { value: '{colors.orangeBoost}' },
              inactive: { value: '{colors.blackVelvet}' },
            },
          },
          scrollbar: {
            thumb: { value: '{colors.eclipseElixir}' },
            track: { value: 'transparent' },
          },
          tags: {
            clm: {
              background: { value: '{colors.cornflower}' },
              text: { value: '{colors.whiteOff}' },
            },
            earnings: { background: { value: '{colors.cornflower}' } },
            retired: { background: { value: '{colors.portRoyale}' } },
            paused: { background: { value: '{colors.molasses}' } },
            boost: { background: { value: '{colors.wildBillBrown}' } },
            platform: {
              gov: { background: { value: '{colors.blueGem}' } },
              clm: { background: { value: '{colors.clematisBlue}' } },
            },
          },
          alert: {
            error: { value: '{colors.redOrange}' },
            warning: { value: '{colors.orangeWarning}' },
            info: { value: '{colors.cornflower}' },
          },
          indicators: {
            loading: { value: '{colors.yellow}' },
            warning: { value: '{colors.orangeWarning}' },
            success: { value: '{colors.green}' },
            error: { value: '{colors.redOrange}' },
            info: { value: '{colors.cornflower}' },
          },
          modal: { backdrop: { value: '{colors.white/20}' } },
          tooltip: {
            light: {
              background: { value: '{colors.white}' },
              text: {
                DEFAULT: { value: '{colors.eclipseElixir}' },
                title: { value: '{colors.eclipseElixir}' },
                content: { value: '{colors.eclipseElixir}' },
                item: { value: '{colors.blackMarket1}' },
                label: { value: '{colors.eclipseElixir}' },
                link: { value: '{colors.eclipseElixir}' },
              },
            },
            dark: {
              background: { value: '{colors.eclipseElixir}' },
              text: {
                DEFAULT: { value: '{colors.whiteOff}' },
                title: { value: '{colors.white}' },
                content: { value: '{colors.whiteOff}' },
                item: { value: '{colors.gray}' },
                label: { value: '{colors.whiteOff}' },
                link: { value: '{colors.white}' },
              },
            },
          },
          dropdown: {
            light: {
              background: { value: '{colors.quillTip}' },
              text: {
                DEFAULT: { value: '{colors.whiteOff}' },
              },
            },
            DEFAULT: {
              background: { value: '{colors.blackMarket1}' },
              text: {
                DEFAULT: { value: '{colors.whiteOff}' },
              },
            },
            dark: {
              background: { value: '{colors.eclipseElixir}' },
              text: {
                DEFAULT: { value: '{colors.whiteOff}' },
              },
            },
          },
          searchInput: {
            background: { value: '{colors.purpleDarkest}' },
            text: { value: '{colors.gray}' },
          },
          networks: {
            arbitrum: { DEFAULT: { value: '#2d374b' } },
            aurora: { DEFAULT: { value: '#70d44b' } },
            avax: { DEFAULT: { value: '#e74142' } },
            base: { DEFAULT: { value: '#ffffff' } },
            berachain: { DEFAULT: { value: '#814625' } },
            bsc: { DEFAULT: { value: '#f0b90b' } },
            canto: { DEFAULT: { value: '#06fc99' } },
            celo: { DEFAULT: { value: '#fcff52' } },
            cronos: { DEFAULT: { value: '#121926' } },
            emerald: { DEFAULT: { value: '#0192f6' } },
            ethereum: { DEFAULT: { value: '#627ee9' } },
            fantom: { DEFAULT: { value: '#1969ff' } },
            fraxtal: { DEFAULT: { value: '#000000' } },
            fuse: { DEFAULT: { value: '#b4f9ba' } },
            gnosis: { DEFAULT: { value: '#133629' } },
            harmony: { DEFAULT: { value: '#01d8af' } },
            heco: { DEFAULT: { value: '#02943f' } },
            kava: { DEFAULT: { value: '#ff564f' } },
            linea: { DEFAULT: { value: '#121212' } },
            lisk: { DEFAULT: { value: '#000000' } },
            manta: { DEFAULT: { value: '#000000' } },
            mantle: { DEFAULT: { value: '#121212' } },
            metis: { DEFAULT: { value: '#00cfff' } },
            mode: { DEFAULT: { value: '#000000' } },
            moonbeam: { DEFAULT: { value: '#958fdc' } },
            moonriver: { DEFAULT: { value: '#06353d' } },
            optimism: { DEFAULT: { value: '#ff0420' } },
            polygon: { DEFAULT: { value: '#f5f0fd' } },
            real: { DEFAULT: { value: '#ffffff' } },
            rootstock: { DEFAULT: { value: '#000000' } },
            scroll: { DEFAULT: { value: '#ffe6c8' } },
            sei: { DEFAULT: { value: '#000000' } },
            sonic: { DEFAULT: { value: '#10283c' }, secondary: { value: '#fe9a4c' } },
            zkevm: { DEFAULT: { value: '#8247e4' } },
            zksync: { DEFAULT: { value: '#ffffff' } },
          },
        },
        sizes: {
          containerInner: {
            xs: {
              value: {
                base: 'calc({sizes.container.xs} - 32px)',
                sm: 'calc({sizes.container.xs} - 48px)',
              },
            },
            sm: {
              value: {
                base: 'calc({sizes.container.sm} - 32px)',
                sm: 'calc({sizes.container.sm} - 48px)',
              },
            },
            md: {
              value: {
                base: 'calc({sizes.container.md} - 32px)',
                sm: 'calc({sizes.container.md} - 48px)',
              },
            },
            lg: {
              value: {
                base: 'calc({sizes.container.lg} - 32px)',
                sm: 'calc({sizes.container.lg} - 48px)',
              },
            },
          },
        },
      },
      keyframes: {
        loadingPulse: {
          from: { transform: 'scale(0.5, 0.5)', opacity: '0.7' },
          to: { transform: 'scale(3.0, 3.0)', opacity: '0' },
        },
        scrollBackground: {
          '0%': {
            backgroundPosition: '0 0',
          },
          '50%': {
            backgroundPosition: '100% 0',
          },
          '100%': {
            backgroundPosition: '0 0',
          },
        },
        fadeInOut: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        rotate: {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        highlight: {
          to: {
            backgroundPosition: '200% center',
          },
        },
        circularProgressDash: {
          '0%': { strokeDasharray: '0px, 200px', strokeDashoffset: '0px' },
          '50%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-15px' },
          '100%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-127px' },
        },
      },
    },
  },
  // Custom config which gets merged with the base config
  {
    textStyles: {
      h1: {
        fontSize: '{fontSizes.h1}',
        lineHeight: '{lineHeights.h1}',
        fontWeight: '{fontWeights.medium}',
      },
      h2: {
        fontSize: '{fontSizes.h2}',
        lineHeight: '{lineHeights.h2}',
        fontWeight: '{fontWeights.medium}',
      },
      h3: {
        fontSize: '{fontSizes.h3}',
        lineHeight: '{lineHeights.h3}',
        fontWeight: '{fontWeights.medium}',
      },
      body: {
        fontSize: '{fontSizes.body}',
        lineHeight: '{lineHeights.body}',
        fontWeight: '{fontWeights.normal}',
      },
      'body.med': {
        fontSize: '{fontSizes.body}',
        lineHeight: '{lineHeights.body}',
        fontWeight: '{fontWeights.medium}',
      },
      'body.sm': {
        fontSize: '{fontSizes.body.sm}',
        lineHeight: '{lineHeights.body.sm}',
        fontWeight: '{fontWeights.normal}',
      },
      'body.sm.med': {
        fontSize: '{fontSizes.body.sm}',
        lineHeight: '{lineHeights.body.sm}',
        fontWeight: '{fontWeights.medium}',
      },
      subline: {
        fontSize: '{fontSizes.subline}',
        lineHeight: '{lineHeights.subline}',
        fontWeight: '{fontWeights.medium}',
        textTransform: 'uppercase',
        letterSpacing: '{letterSpacings.subline}',
      },
      'subline.sm': {
        fontSize: '{fontSizes.subline.sm}',
        lineHeight: '{lineHeights.subline.sm}',
        fontWeight: '{fontWeights.medium}',
        textTransform: 'uppercase',
        letterSpacing: '{letterSpacings.subline}',
      },
      inherit: {
        fontSize: 'inherit',
        lineHeight: 'inherit',
        fontWeight: 'inherit',
        textTransform: 'inherit',
        letterSpacing: 'inherit',
      },
    },
    buttons: {
      default: {
        base: {
          color: '{colors.text.light}',
          background: '{colors.bayOfMany}',
          border: '{colors.bayOfMany}',
        },
        hover: {
          background: '{colors.blueJewel}',
          border: '{colors.blueJewel}',
        },
      },
      light: {
        base: {
          color: '{colors.text.light}',
          background: '{colors.quillTip}',
          border: '{colors.quillTip}',
        },
      },
      success: {
        base: {
          color: '{colors.text.light}',
          background: '{colors.green}',
          border: '{colors.green}',
        },
        hover: {
          background: '{colors.greenLight}',
          border: '{colors.greenLight}',
        },
      },
      boost: {
        base: {
          color: '{colors.text.light}',
          background: '{colors.orangeBoost}',
          border: '{colors.orangeBoost}',
        },
        hover: {
          background: '{colors.orangeBoostLight}',
          border: '{colors.orangeBoostLight}',
        },
      },
      filter: {
        base: {
          color: '{colors.text.dark}',
          background: '{colors.background.content.dark}',
          border: '{colors.background.content}',
        },
        hover: {
          color: '{colors.text.middle}',
        },
        active: {
          color: '{colors.text.light}',
          background: '{colors.background.button}',
          border: '{colors.background.content.light}',
        },
        disabled: {
          color: '{colors.text.middle}',
          border: '{colors.background.content}',
        },
      },
      range: {
        base: {
          color: '{colors.text.dark}',
          background: 'transparent',
          border: 'transparent',
        },
        hover: {
          color: '{colors.text.middle}',
        },
        active: {
          color: '{colors.text.light}',
        },
      },
    },
    zIndex: {
      highlight: 100,
      slider: 200,
      dropdown: 500,
      badge: 600,
      tooltip: 700,
      version: 800,
      modal: 900,
    },
  }
);

// eslint-disable-next-line no-restricted-syntax -- default export required for Panda
export default defineConfig(config);
