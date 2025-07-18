import svgrPlugin from 'vite-plugin-svgr';
import { types as t } from '@babel/core';

export function standardSvgrPlugin() {
  return svgrPlugin({
    exclude: 'src/images/icons/mui/*.svg?react',
    svgrOptions: {
      expandProps: 'end',
      memo: true,
      ref: true,
    },
  });
}

export function muiCompatSvgrPlugin() {
  return svgrPlugin({
    include: 'src/images/icons/mui/*.svg?react',
    esbuildOptions: {
      loader: 'tsx',
    },
    svgrOptions: {
      expandProps: 'end',
      typescript: true,
      memo: true,
      ref: true,
      svgProps: {
        focusable: 'false',
        'aria-hidden': 'true',
      },
      template: (variables, { tpl }) => {
        const tmpProps = variables.props[0] as t.Identifier;
        tmpProps.name = 'tmpProps';
        const props = t.identifier('props');
        const cx = t.identifier('cx');
        const className = t.identifier('className');
        const importCx = t.importDeclaration(
          [t.importSpecifier(cx, cx)],
          t.stringLiteral('@repo/styles/css')
        );
        const mergeClassNameProp = t.variableDeclaration('const', [
          t.variableDeclarator(
            props,
            t.objectExpression([
              t.spreadElement(tmpProps),
              t.objectProperty(
                className,
                t.callExpression(cx, [
                  t.stringLiteral('mui-svg'),
                  t.memberExpression(tmpProps, className),
                ])
              ),
            ])
          ),
        ]);

        return tpl`
${variables.imports};
${importCx}

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => {
  ${mergeClassNameProp};
  return (${variables.jsx});
};

${variables.exports};
`;
      },
    },
  });
}
