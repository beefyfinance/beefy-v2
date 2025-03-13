import type {
  Artifact,
  CodegenPrepareHookArgs,
  LoggerInterface,
  PandaPlugin,
} from '@pandacss/types';
import type { PandaContext } from '@pandacss/node';

export const pluginMoreTypes = (): PandaPlugin => {
  let logger: LoggerInterface;
  let ctx: PandaContext;

  return {
    name: 'more-types',
    hooks: {
      'context:created': context => {
        logger = context.logger;
        // @ts-expect-error
        ctx = context.ctx.processor.context;
      },
      'codegen:prepare': args => {
        return applyTransforms(args, ctx, logger);
      },
    },
  };
};

const transforms: Partial<Record<Artifact['id'], Record<string, (content: string) => string>>> = {
  'css-fn': {
    'css.d.ts': (content: string) => {
      return content + `\n\nexport type CssStyles = Styles | Styles[];`;
    },
  },
  'types-gen-system': {
    'system-types.d.ts': (content: string) => {
      return content
        .replace(
          'interface WithCss {',
          'type Styles = SystemStyleObject | undefined | null | false;\n\ninterface WithCss {'
        )
        .replace('css?: SystemStyleObject | SystemStyleObject[]', 'css?: Styles | Styles[]');
    },
  },
};

export const applyTransforms = (
  { artifacts }: CodegenPrepareHookArgs,
  _ctx: PandaContext,
  _logger?: LoggerInterface
) => {
  for (const artifact of artifacts) {
    const transform = transforms[artifact.id];
    if (!transform) {
      continue;
    }

    for (const file of artifact.files) {
      if (!file.code) {
        continue;
      }

      const transformFn = transform[file.file];
      if (!transformFn) {
        continue;
      }

      file.code = transformFn(file.code);
    }
  }

  return artifacts;
};
