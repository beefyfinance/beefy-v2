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
        zIndex: { addEscapeHatch: true },
        color: { add: ['"transparent"', '"inherit"'] },
        backgroundColor: { add: ['"transparent"', '"inherit"'] },
        borderColor: { add: ['"transparent"', '"inherit"'], addEscapeHatch: true /* for 2/4 */ },
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
        '--onboard-modal-background': '{colors.blackMarket}',
        '--onboard-main-scroll-container-background': '{colors.blackMarket}',
        '--onboard-close-button-background': '{colors.blackMarket}',
        '--onboard-close-button-color': '{colors.text.middle}',
        '--onboard-wallet-button-border-color': '{colors.blackMarket}',
        '--onboard-wallet-button-background': '{colors.background.content.light}',
        '--onboard-wallet-button-color': '{colors.text.middle}',
        '--onboard-wallet-button-background-hover': '{colors.alertBaseBackground}',
        '--onboard-wallet-button-color-hover': '{colors.text.lightest}',
        '--onboard-wallet-app-icon-border-color': '{colors.text.lightest}',
        '--onboard-wallet-app-icon-background-transparent': '{colors.text.lightest}',
        '--onboard-connect-sidebar-background': '{colors.background.header}',
        '--onboard-connect-sidebar-color': '{colors.text.light}',
        '--onboard-connect-sidebar-progress-color': '{colors.greenLight}',
        '--onboard-connect-sidebar-progress-background': '{colors.green}',
        '--onboard-link-color': '{colors.text.dark}',
        '--tooltip-content-vertical-padding': '12px',
        '--tooltip-content-horizontal-padding': '16px',
        '--tooltip-content-vertical-gap': '8px',
        '--tooltip-content-horizontal-gap': '24px',
        '--tooltip-content-border-radius': '8px',
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
        fontWeight: 'medium',
      },
      h2: {
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: 'medium',
      },
      h3: {
        fontSize: '21px',
        lineHeight: '24px',
        fontWeight: 'medium',
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
        textStyle: 'body.medium',
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
          height: '0.5rem',
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
          text: {
            lightest: { value: '#fff' },
            light: { value: '#f5f5f5' },
            middle: { value: '#d0d0da' },
            dark: { value: '#999cb3' },
          },
          modal: { backdrop: { value: '#ffffff33' } },
          alertBaseBackground: { value: '#f5f5ff14' },
          bayOfMany: { value: '#363b63', description: 'border + button bg' },
          birdgeQuoteButtonSelectedHoverBackground: { value: '#232741' },
          black: { value: '#000000' },
          blackMarket: {
            value: '#242842',
            description: 'light tooltip text value + contentPrimary + vaults.default + txsModal.bg',
          },
          blueJewel: { value: '#495086', description: 'bg hover for some buttons' },
          bridgeQuoteSelectorScrollThumb: { value: '#373b60' },
          chainIconUnselectedBackground: { value: '#2e324c' },
          changeNegative: { value: '#e84525' },
          changePositive: { value: '#509658' },
          contentBackgroundLight: { value: '#2d3153', description: 'contentLight' },
          cornflower: { value: '#5c70d6', description: 'tag.points + indicators.info' },
          dashboardSummaryIconBackground: {
            value: '#232644',
            description: 'dashboard summary icon bg',
          },
          dashboardVaultText: { value: '#9595b2' },
          eclipseElixir: {
            value: '#1c1e32',
            description:
              'light tooltip text title/content/label/link + contentDark + tooltip dark bg',
          },
          explorerLinkBorder: { value: '#363a61' },
          exposureOther: { value: '#c2d65c' },
          exposureStable: { value: '#3d5cf5' },
          filtersBoxShadowSolid: { value: '#14122133' },
          filtersBoxShadowTransparent: { value: '#13112228' },
          graphLegendRange: { value: '#3f446e' },
          graphLegendUsd: { value: '#606fcf' },
          graphTooltipBackground: { value: '#1b1d32' },
          greenDark: { value: '#004708', description: 'primary dark' },
          greenLight: { value: '#68be71', description: 'primary light' },
          headerFooterBackground: { value: '#020203', description: 'footer header' },
          indicatorLoading: { value: '#d6d05d', description: 'indicators.loading' },
          linkIconHoverBackground: { value: '#3f466d' },
          loaderPurple: { value: '#313759' },
          loaderPurpleHighlight: { value: '#8585a6' },
          minterButtonDisabledBackground: { value: '#ffffff33' },
          missingNetworkIconBackground: { value: 'magenta' },
          modalProgressBarBackground: { value: '#e5e5e5', description: 'txsModal.bgLine' },
          mtPellerin: { value: '#121212' },
          onRampIconLoading: { value: '#ffffff1e' },
          orangeBoost: { value: '#db8332', description: 'boost button bg + vaults boost' },
          orangeBoostLight: { value: '#e5a66b', description: 'boost button bg hover' },
          orangeWarning: { value: '#d19847', description: 'indicators.warning' },
          purpleDarkest: { value: '#121421', description: 'app bg + search input bg' },
          redError: { value: '#da5932', description: 'indicators.error' },
          scrollableShadowSolid: { value: '#0000007f' },
          selectOptionActiveBackground: { value: '#ffffff28' },
          stepperErrorBackground: { value: '#db323219' },
          stepperSuccessBackground: { value: '#59a66226' },
          tagBoostBackground: { value: '#775744', description: 'tag.boost' },
          tagClmBackground: { value: '#0052CC', description: 'tag.clm' },
          tagPausedBackground: { value: '#564a46', description: 'tag.paused' },
          tagPlatformClmBackground: { value: '#38428f', description: 'tag.platformClm' },
          tagPlatformGovBackground: { value: '#4b388f', description: 'tag.platformGov' },
          tagRetiredBackground: { value: '#532f39', description: 'tag.retired' },
          tenderlyCallStackTagBackground: { value: '#9873f01e' },
          tenderlyCallStackTagText: { value: '#9873f0' },
          tenderlyJumpDestStackTagBackground: { value: '#23c1971e' },
          tenderlyJumpDestStackTagBorder: { value: '#23c197' },
          tenderlyJumpDestStackTagText: { value: '#30a46c' },
          tenderlyPairDisplayAltText: { value: '#ed9889' },
          tenderlyRevertStackTagBackground: { value: '#f020561e' },
          tenderlyRevertStackTagBorder: { value: '#f02056' },
          tenderlyStackFuncText: { value: '#9e8cfc' },
          tenderlyStackPairName: { value: '#edc389' },
          tenderlyStackSourceStrongText: { value: '#e5484d' },
          tenderlyStackTagBackground: { value: '#CEC0F01e' },
          tenderlyStackTagText: { value: '#cec0f0' },
          tenderlyStackToText: { value: '#71aefe' },
          tooltipDropdownBoxShadow: { value: '#00000033' },
          transactDebuggerBackground: { value: '#111111' },
          transactDebuggerItemAltBackground: { value: '#222222' },
          transactErrorBackground: { value: '#da59327c' },
          transactWarningBackground: { value: '#d198477c' },
          treasuryHeaderSystem9: { value: '#f3f3c87f' },
          vaultClmPoolBackground: { value: '#252c63', description: 'vaults clm + vaults clmPool' },
          vaultClmVaultBackground: { value: '#1e2a48', description: 'vaults clmVault' },
          vaultGovBackground: { value: '#322460', description: 'vaults gov' },
          vaultInactiveVaultbackground: { value: '#242032', description: 'vaults inactive' },
          vaultPausedBackground: { value: '#d153470c' },
          vaultTagDividerBackground: { value: '#D9D9D949' },
          zapDiscountedFeesBackground: { value: '#59a662' },
          gold: {
            '10': {
              value: '#f7f3e3',
            },
            '20': {
              value: '#f7e9ca',
            },
            '30': {
              value: '#f8dfa9',
            },
            '40': {
              value: '#f3d894',
            },
            '50': {
              value: '#eccc7d',
            },
            '60': {
              value: '#e3bd63',
            },
            '70': {
              value: '#d7a861',
            },
            '80': {
              DEFAULT: { value: '#b17f49' },
              '40': {
                value: '#B17F4966',
              },
            },
            '90': {
              value: '#865c3b',
            },
            '100': {
              value: '#5f412e',
            },
          },
          green: {
            DEFAULT: { value: '#4db258', description: 'primary main + indicators.success' },
            '10': {
              value: '#e3faeb',
            },
            '20': {
              value: '#baf0ca',
            },
            '30': {
              value: '#95e2a8',
            },
            '40': {
              DEFAULT: {
                value: '#72d286',
              },
              '12': {
                value: '#72D2861E',
              },
            },
            '50': {
              value: '#53be64',
            },
            '60': {
              value: '#449a4d',
            },
            '70': {
              value: '#368a4d',
            },
            '80': {
              DEFAULT: {
                value: '#2a784c',
              },
              '40': {
                value: '#2A784C66',
              },
            },
            '90': {
              value: '#1f6549',
            },
            '100': {
              value: '#155042',
            },
          },
          darkblue: {
            '40': {
              value: '#3f4574',
            },
            '50': {
              value: '#363b63',
            },
            '60': {
              value: '#2d3153',
            },
            '70': {
              value: '#242842',
            },
            '80': {
              value: '#1c1e32',
            },
            '90': {
              value: '#111321',
            },
            '100': {
              DEFAULT: {
                value: '#020203',
              },
              '64': {
                value: '#020203A3',
              },
            },
          },
          red: {
            DEFAULT: { value: '#dc2c10', description: 'txsModal.error' },
            '10': {
              value: '#ffe9e3',
            },
            '20': {
              value: '#ffd5c8',
            },
            '30': {
              value: '#ffc1ae',
            },
            '40': {
              value: '#ffa98f',
            },
            '50': {
              value: '#ff9269',
            },
            '60': {
              value: '#ee784c',
            },
            '70': {
              value: '#e66e42',
            },
            '80': {
              DEFAULT: {
                value: '#df6539',
              },
              '40': {
                value: '#DF653966',
              },
            },
            '90': {
              value: '#d85c30',
            },
            '100': {
              value: '#cf5024',
            },
          },
          white: {
            DEFAULT: { value: '#ffffff' },
            '70': {
              DEFAULT: {
                value: '#999cb3',
              },
              '4': {
                value: '#999CB30A',
              },
              '24': {
                value: '#999CB33D',
              },
              '64': {
                value: '#999CB3A3',
              },
            },
            '80': {
              value: '#bcbecd',
            },
            '90': {
              DEFAULT: {
                value: '#d0d0da',
              },
              '4': {
                value: '#D0D0DA0A',
              },
              '24': {
                value: '#D0D0DA3D',
              },
              '64': {
                value: '#D0D0DAA3',
              },
            },
            '100': {
              DEFAULT: {
                value: '#f5f5ff',
              },
              '4': {
                value: '#F5F5FF0A',
              },
              '24': {
                value: '#F5F5FF3D',
              },
              '64': {
                value: '#F5F5FFA3',
              },
            },
          },
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
          bold: { value: 700 },
        },
        letterSpacings: {
          subline: { value: '0.5px' },
        },
      },
      semanticTokens: {
        colors: {
          background: {
            header: { value: '{colors.headerFooterBackground}' },
            body: { value: '{colors.purpleDarkest}' },
            footer: { value: '{colors.headerFooterBackground}' },
            border: { value: '{colors.bayOfMany}' },
            button: { value: '{colors.bayOfMany}' },
            content: {
              DEFAULT: { value: '{colors.blackMarket}' },
              dark: { value: '{colors.eclipseElixir}' },
              light: { value: '{colors.contentBackgroundLight}' },
            },
            vaults: {
              standard: { value: '{colors.blackMarket}' },
              gov: { value: '{colors.vaultGovBackground}' },
              clm: {
                DEFAULT: { value: '{colors.vaultClmPoolBackground}' },
                pool: { value: '{colors.vaultClmPoolBackground}' },
                vault: { value: '{colors.vaultClmVaultBackground}' },
              },
              boost: { value: '{colors.orangeBoost}' },
              inactive: { value: '{colors.vaultInactiveVaultbackground}' },
            },
          },
          scrollbar: {
            thumb: { value: '{colors.eclipseElixir}' },
            track: { value: 'transparent' },
          },
          tags: {
            clm: {
              background: { value: '{colors.tagClmBackground}' },
              text: { value: '{colors.text.light}' },
            },
            earnings: { background: { value: '{colors.cornflower}' } },
            retired: { background: { value: '{colors.tagRetiredBackground}' } },
            paused: { background: { value: '{colors.tagPausedBackground}' } },
            boost: { background: { value: '{colors.tagBoostBackground}' } },
            platform: {
              gov: { background: { value: '{colors.tagPlatformGovBackground}' } },
              clm: { background: { value: '{colors.tagPlatformClmBackground}' } },
            },
          },
          alert: {
            error: {
              icon: { value: '{colors.redError}' },
              background: { value: '#d1534726' },
            },
            warning: {
              icon: { value: '{colors.orangeWarning}' },
              background: { value: '#d1984726' },
            },
            info: {
              icon: { value: '{colors.cornflower}' },
              background: { value: '#5c70d623' },
            },
          },
          indicators: {
            loading: { value: '{colors.indicatorLoading}' },
            warning: { value: '{colors.orangeWarning}' },
            success: { value: '{colors.green}' },
            error: { value: '{colors.redError}' },
            info: { value: '{colors.cornflower}' },
          },
          notification: {
            confirmation: {
              primary: { value: '{colors.green.40}' },
              background: { value: '{colors.green.80.40}' },
            },
            teaser: {
              primary: { value: '{colors.gold.40}' },
              background: { value: '{colors.gold.80.40}' },
            },
          },
          tooltip: {
            light: {
              background: { value: '{colors.white}' },
              text: {
                DEFAULT: { value: '{colors.eclipseElixir}' },
                title: { value: '{colors.eclipseElixir}' },
                content: { value: '{colors.eclipseElixir}' },
                item: { value: '{colors.blackMarket}' },
                label: { value: '{colors.eclipseElixir}' },
                link: { value: '{colors.eclipseElixir}' },
              },
            },
            dark: {
              background: { value: '{colors.eclipseElixir}' },
              text: {
                DEFAULT: { value: '{colors.text.light}' },
                title: { value: '{colors.white}' },
                content: { value: '{colors.text.light}' },
                item: { value: '{colors.text.middle}' },
                label: { value: '{colors.text.light}' },
                link: { value: '{colors.white}' },
              },
            },
          },
          dropdown: {
            light: {
              background: { value: '{colors.contentBackgroundLight}' },
              text: {
                DEFAULT: { value: '{colors.text.light}' },
              },
            },
            base: {
              background: { value: '{colors.blackMarket}' },
              text: {
                DEFAULT: { value: '{colors.text.light}' },
              },
            },
            dark: {
              background: { value: '{colors.eclipseElixir}' },
              text: {
                DEFAULT: { value: '{colors.text.light}' },
              },
            },
            button: {
              background: { value: '{colors.bayOfMany}' },
              text: {
                DEFAULT: { value: '{colors.text.light}' },
              },
            },
          },
          searchInput: {
            background: { value: '{colors.purpleDarkest}' },
            text: { value: '{colors.text.middle}' },
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
      'body.medium': {
        fontSize: '{fontSizes.body}',
        lineHeight: '{lineHeights.body}',
        fontWeight: '{fontWeights.medium}',
      },
      'body.bold': {
        fontSize: '{fontSizes.body}',
        lineHeight: '{lineHeights.body}',
        fontWeight: '{fontWeights.bold}',
      },
      'body.sm': {
        fontSize: '{fontSizes.body.sm}',
        lineHeight: '{lineHeights.body.sm}',
        fontWeight: '{fontWeights.normal}',
      },
      'body.sm.medium': {
        fontSize: '{fontSizes.body.sm}',
        lineHeight: '{lineHeights.body.sm}',
        fontWeight: '{fontWeights.medium}',
      },
      'body.sm.bold': {
        fontSize: '{fontSizes.body.sm}',
        lineHeight: '{lineHeights.body.sm}',
        fontWeight: '{fontWeights.bold}',
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
          background: '{colors.contentBackgroundLight}',
          border: '{colors.contentBackgroundLight}',
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
      dark: {
        base: {
          color: '{colors.text.middle}',
          background: '{colors.purpleDarkest}',
          border: 'none',
        },
        hover: {
          background: '{colors.purpleDarkest}',
          color: '{colors.text.middle}',
        },
        active: {
          background: '{colors.purpleDarkest}',
          color: '{colors.text.light}',
        },
      },
      middle: {
        base: {
          color: '{colors.text.middle}',
          background: '{colors.blackMarket}',
          border: 'none',
        },
        hover: {
          background: '{colors.blackMarket}',
          color: '{colors.text.middle}',
        },
        active: {
          background: '{colors.blackMarket}',
          color: '{colors.text.light}',
        },
      },
    },
    zIndex: {
      thumb: 10,
      highlight: 100,
      slider: 200,
      dropdown: 500,
      badge: 600,
      tooltip: 700,
      version: 800,
      modal: 900,
    },
    networks: {
      arbitrum: { primary: '#2d374b', header: '#289fef33' },
      aurora: { primary: '#70d44b', header: 0.2 },
      avax: { primary: '#e74142', header: 0.2 },
      base: { primary: '#ffffff', header: '#0052ff33' },
      berachain: { primary: '#814625', header: 1 },
      bsc: { primary: '#f0b90b', header: 0.2 },
      canto: { primary: '#06fc99', header: 0.2 },
      celo: { primary: '#fcff52', header: 0.2 },
      cronos: { primary: '#121926', header: 1 },
      emerald: { primary: '#0192f6', header: 0.2 },
      ethereum: { primary: '#627ee9', header: 0.2 },
      fantom: { primary: '#1969ff', header: 0.2 },
      fraxtal: { primary: '#000000', header: '#12121233' },
      fuse: { primary: '#b4f9ba', header: 0.2 },
      gnosis: { primary: '#133629', header: 0.4 },
      harmony: { primary: '#01d8af', header: '#00d8af33' },
      heco: { primary: '#02943f', header: 0.2 },
      kava: { primary: '#ff564f', header: 0.2 },
      linea: { primary: '#121212', header: 0.2 },
      lisk: { primary: '#000000', header: '#12121233' },
      manta: { primary: '#000000', header: '#12121233' },
      mantle: { primary: '#121212', header: 0.2 },
      metis: { primary: '#00cfff', header: 0.4 },
      mode: { primary: '#000000', header: '#12121233' },
      moonbeam: { primary: '#958fdc', header: 0.4 },
      moonriver: { primary: '#06353d', header: 0.4 },
      optimism: { primary: '#ff0420', header: 0.2 },
      polygon: { primary: '#f5f0fd', header: 0.3 },
      real: { primary: '#ffffff', header: '#1c122c66' },
      rootstock: { primary: '#000000', header: '#1c122c66' },
      scroll: { primary: '#ffe6c8', header: '#c9cbce' },
      sei: { primary: '#000000', header: '#1c122c66' },
      sonic: { primary: '#10283c', secondary: '#fe9a4c', header: { primary: 0.5, secondary: 0.5 } },
      zkevm: { primary: '#8247e4', header: 0.2 },
      zksync: { primary: '#ffffff', header: '#0000004c' },
    },
  }
);

// eslint-disable-next-line no-restricted-syntax -- default export required for Panda
export default defineConfig(config);
